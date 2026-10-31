import crypto from "crypto";
import validator from "validator";
import { TopUp } from "../models/topUpModel.js";
import { Booking } from "../models/bookingModel.js";
import { logActivity } from "../utils/activity.js";
import { fetchPaystackTransaction } from "./paymentController.js";

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 200000;

// Marks a top-up paid for a successful Paystack transaction. Idempotent, so the
// page, the webhook and a retry can all call it safely.
export const settleTopUp = async (tx) => {
  const topUp = await TopUp.findOne({ reference: tx.reference });
  if (!topUp) return { topUp: null };
  if (topUp.status === "paid") return { topUp, already: true };

  const paid = tx.amount / 100;
  if (paid + 1 < topUp.amount) {
    const err = new Error(`Paid ₦${paid.toLocaleString()} but ₦${topUp.amount.toLocaleString()} was expected`);
    err.status = 400;
    throw err;
  }

  const updated = await TopUp.findOneAndUpdate(
    { _id: topUp._id, status: "pending" },
    { status: "paid", paidAt: new Date() },
    { new: true }
  );
  if (!updated) return { topUp: await TopUp.findById(topUp._id), already: true };

  await logActivity(
    "topup_paid",
    `${updated.payerName} paid ₦${paid.toLocaleString()} (extra payment${
      updated.entryCode ? ` for booking #${updated.entryCode}` : ""
    }${updated.note ? `: ${updated.note}` : ""}) - ref ${updated.reference}`,
    { reference: updated.reference, amount: paid, entryCode: updated.entryCode, bookingId: updated.bookingId && String(updated.bookingId) }
  );
  return { topUp: updated };
};

// POST /payment/topup { name, email, amount, entryCode?, note? }
// Creates the payment record and returns the reference + amount to charge.
export const startTopUp = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const amount = Math.round(Number(req.body?.amount));
    const entryCode = String(req.body?.entryCode || "").trim();
    const note = String(req.body?.note || "").trim().slice(0, 300);

    if (!name) return res.status(400).json({ success: false, message: "Please enter your name" });
    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ₦${MIN_AMOUNT.toLocaleString()} and ₦${MAX_AMOUNT.toLocaleString()}`,
      });
    }

    let booking = null;
    if (entryCode) {
      booking = await Booking.findOne({ code: entryCode, status: "confirmed" }, "name code");
      if (!booking) return res.status(404).json({ success: false, message: "We couldn't find a booking with that entry code" });
    }

    const reference = `tu-${Date.now()}-${crypto.randomBytes(5).toString("hex")}`;
    await TopUp.create({
      reference,
      amount,
      payerName: name,
      payerEmail: email,
      entryCode: booking?.code,
      bookingId: booking?._id,
      note,
    });

    res.json({ success: true, reference, amount, forBooking: booking ? { name: booking.name, code: booking.code } : null });
  } catch (error) {
    console.error("Start top-up error:", error);
    res.status(500).json({ success: false, message: "Couldn't start the payment. Please try again." });
  }
};

// POST /payment/topup/verify { reference } - called by the page after Paystack succeeds
export const verifyTopUp = async (req, res) => {
  try {
    const reference = String(req.body?.reference || "");
    if (!reference.startsWith("tu-")) return res.status(400).json({ success: false, message: "Unknown reference" });

    const tx = await fetchPaystackTransaction(reference);
    if (tx?.status !== "success") {
      return res.status(400).json({ success: false, message: "Payment not confirmed yet" });
    }
    const { topUp } = await settleTopUp(tx);
    if (!topUp) return res.status(404).json({ success: false, message: "Payment record not found" });
    res.json({ success: true, message: "Payment received. Thank you!", amount: topUp.amount, reference: topUp.reference });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ success: false, message: error.message });
    console.error("Verify top-up error:", error);
    res.status(500).json({ success: false, message: "Couldn't confirm the payment. If you were charged, it will be confirmed automatically." });
  }
};
