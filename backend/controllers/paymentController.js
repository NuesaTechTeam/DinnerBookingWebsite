import axios from "axios";
import crypto from "crypto";
import {Booking} from "../models/bookingModel.js"
import { Seat } from "../models/seatModel.js";
import { sendConfirmationEmail, sendFeedbackNotification } from "../utils/emailService.js";
import mongoose from "mongoose";
import { Table } from "../models/tableModel.js";
import { markDiscountUsed } from "./discountController.js";
import { logActivity } from "../utils/activity.js";

// Paystack statuses that mean money may still arrive (bank transfer, USSD...)
const IN_FLIGHT = ["ongoing", "pending", "processing", "queued"];

// Look a transaction up on Paystack. Returns null if Paystack has never seen
// the reference (the popup was never opened).
export const fetchPaystackTransaction = async (reference) => {
  if (!reference || reference.startsWith("pending_")) return null;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) return null;
    throw error;
  }
};

// What Paystack says about an unpaid reservation before we dare remove it:
// "paid" (confirm it instead), "in_flight" (keep holding), "unpaid" (safe to remove).
// Any error talking to Paystack counts as "in_flight" so we never delete blind.
export const checkPendingBooking = async (booking) => {
  try {
    const tx = await fetchPaystackTransaction(booking.paystackRef);
    if (tx?.status === "success") {
      await confirmPaidBooking(booking._id, tx);
      return "paid";
    }
    if (tx && IN_FLIGHT.includes(tx.status)) return "in_flight";
    return "unpaid";
  } catch (error) {
    console.error(`Paystack check failed for booking ${booking._id}:`, error.message);
    return "in_flight";
  }
};

// Confirms a booking for a successful Paystack transaction. Idempotent: safe
// to call from the browser callback, the webhook and the cleanup job.
export const confirmPaidBooking = async (bookingId, tx) => {
  const amountPaid = tx.amount / 100;
  const session = await mongoose.startSession();
  let booking;
  let alreadyConfirmed = false;
  let conflicts = [];

  try {
    await session.withTransaction(async () => {
      booking = await Booking.findById(bookingId).session(session);
      if (!booking) return;
      if (booking.status === "confirmed" && booking.paymentVerified) {
        alreadyConfirmed = true;
        return;
      }

      // Paystack may add its own fee on top and can round, so only reject
      // genuine underpayments.
      const expectedAmount = Number(booking.totalAmount) || 0;
      if (amountPaid + 1 < expectedAmount) {
        const err = new Error(
          `Amount paid (₦${amountPaid.toLocaleString()}) is less than the expected amount (₦${expectedAmount.toLocaleString()})`
        );
        err.status = 400;
        throw err;
      }

      booking.paymentVerified = true;
      booking.status = "confirmed";
      booking.paystackRef = tx.reference;
      booking.trxref = tx.reference;
      await booking.save({ session });

      // Never take a seat away from someone else's confirmed booking - the
      // payment still stands, and the conflict is flagged for an admin.
      const seats = await Seat.find({ _id: { $in: booking.seats } }, "seatNumber table isBooked bookedBy", { session });
      const mine = seats.filter((s) => !s.isBooked || String(s.bookedBy) === String(booking._id));
      conflicts = seats.filter((s) => !mine.includes(s)).map((s) => s.seatNumber);

      await Seat.updateMany(
        { _id: { $in: mine.map((s) => s._id) } },
        { isBooked: true, bookedBy: booking._id, lockedUntil: null },
        { session }
      );

      const tableUpdates = {};
      mine.forEach((seat) => {
        (tableUpdates[seat.table] ||= []).push(seat.seatNumber);
      });
      for (const [tableId, seatNumbers] of Object.entries(tableUpdates)) {
        await Table.findByIdAndUpdate(
          tableId,
          { $addToSet: { bookedSeats: { $each: seatNumbers } } },
          { session }
        );
      }
    });
  } finally {
    session.endSession();
  }

  if (!booking || alreadyConfirmed) return { booking, alreadyConfirmed };

  if (booking.discountApplied && booking.couponCode) {
    try {
      await markDiscountUsed(booking.couponCode, booking._id);
    } catch (error) {
      console.error("Could not mark discount used:", error.message);
    }
  }

  await sendConfirmationEmail(booking);

  logActivity(
    "payment_verified",
    `${booking.name} paid ₦${amountPaid.toLocaleString()} - booking confirmed`,
    { bookingId: booking._id.toString(), reference: tx.reference, amount: amountPaid }
  );
  if (conflicts.length) {
    logActivity(
      "seat_conflict",
      `${booking.name} paid but seat(s) ${conflicts.join(", ")} were already taken - reassign manually`,
      { bookingId: booking._id.toString(), reference: tx.reference, seats: conflicts }
    );
  }

  return { booking, alreadyConfirmed: false, conflicts };
};

//Verify Paystack payment (called by the browser after the popup succeeds)
export const verifyPayment = async (req, res) => {
    try {
        const {reference, bookingId} = req.body

        const tx = await fetchPaystackTransaction(reference);
        if (tx?.status !== "success") {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            })
        }

        const { booking } = await confirmPaidBooking(bookingId, tx);
        if (!booking) {
          logActivity(
            "payment_orphaned",
            `Paystack payment ${reference} (₦${tx.amount / 100}, ${tx.customer?.email}) has no booking ${bookingId}`,
            { reference, bookingId, email: tx.customer?.email, amount: tx.amount / 100 }
          );
          return res.status(404).json({
            success: false,
            message: "Booking not found",
          });
        }

        //for now
        // await sendFeedbackNotification(booking)

        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          booking,
        });
    } catch (error) {
        if (error.status === 400) {
          return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        })
    }
}

// Paystack webhook: confirms bookings even if the guest closed the tab, lost
// signal, or paid by transfer after the popup was closed.
// Configure in Paystack dashboard -> Settings -> API Keys & Webhooks:
//   https://<backend>/payment/webhook
export const paystackWebhook = async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(req.rawBody || "")
    .digest("hex");
  if (!signature || signature !== expected) {
    return res.sendStatus(401);
  }

  // Acknowledge straight away; Paystack retries if we are slow
  res.sendStatus(200);

  try {
    const { event, data } = req.body || {};
    if (event !== "charge.success") return;

    // Never trust the webhook body alone - re-verify with Paystack
    const tx = await fetchPaystackTransaction(data.reference);
    if (tx?.status !== "success") return;

    let meta = tx.metadata;
    if (typeof meta === "string") {
      try { meta = JSON.parse(meta); } catch { meta = {}; }
    }
    const booking =
      (await Booking.findOne({ paystackRef: tx.reference })) ||
      (meta?.bookingId && mongoose.isValidObjectId(meta.bookingId)
        ? await Booking.findById(meta.bookingId)
        : null);

    if (!booking) {
      logActivity(
        "payment_orphaned",
        `Paystack payment ${tx.reference} (₦${tx.amount / 100}, ${tx.customer?.email}) has no booking - recover with utils/recoverBooking.js`,
        { reference: tx.reference, bookingId: meta?.bookingId, email: tx.customer?.email, amount: tx.amount / 100 }
      );
      return;
    }
    await confirmPaidBooking(booking._id, tx);
  } catch (error) {
    console.error("Paystack webhook error:", error);
  }
};
