import dns from "dns";
import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";
import { getMealOptions } from "./meals.js";
import { sendConfirmationEmail } from "./emailService.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Turns one successful-but-lost Paystack payment back into a confirmed booking.
// DRY RUN by default - nothing is written unless --apply is passed.
//
//   node utils/recoverBooking.js <paystackReference>                      (pending booking still exists: reuse its seats)
//   node utils/recoverBooking.js <paystackReference> --seats VIP-1-S2,VIP-1-S3   (booking was deleted: pick seats)
//   ... --apply            write the booking and book the seats
//   ... --apply --email    also send the confirmation/ticket email
//
// Needs PROD_MONGO_URI and PAYSTACK_SECRET_KEY in the environment.

const reference = process.argv[2];
const apply = process.argv.includes("--apply");
const sendEmail = process.argv.includes("--email");
const seatsArg = process.argv.indexOf("--seats");
const seatNumbers =
  seatsArg > -1 ? process.argv[seatsArg + 1].split(",").map((s) => s.trim()).filter(Boolean) : null;

const customerTotal = (base) => Math.round(base + Math.min(0.03 * base + 100, 2000));

const run = async () => {
  if (!reference || reference.startsWith("--")) {
    console.error("Usage: node utils/recoverBooking.js <paystackReference> [--seats A,B] [--apply] [--email]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}`);

  // 1. Re-verify the payment with Paystack itself
  const { data } = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const tx = data.data;
  if (tx.status !== "success") throw new Error(`Paystack status is "${tx.status}", not success`);
  let meta = tx.metadata;
  if (typeof meta === "string") meta = JSON.parse(meta || "{}");
  const field = (n) => meta?.custom_fields?.find((f) => f.variable_name === n)?.value || "";
  const amountPaid = tx.amount / 100;
  console.log(`Paystack: ₦${amountPaid} from ${tx.customer.email} (${field("full_name")}) paid ${tx.paid_at}`);

  // 2. Never double-use a payment
  const already = await Booking.findOne({ paystackRef: reference, status: "confirmed" });
  if (already) throw new Error(`Reference already confirms booking ${already._id} - nothing to do`);

  const existing =
    meta?.bookingId && mongoose.isValidObjectId(meta.bookingId)
      ? await Booking.findById(meta.bookingId)
      : null;

  // 3. Work out which seats
  let seats;
  if (seatNumbers) seats = await Seat.find({ seatNumber: { $in: seatNumbers } }).populate("table");
  else if (existing) seats = await Seat.find({ _id: { $in: existing.seats } }).populate("table");
  else throw new Error("Original booking was deleted - pass --seats to choose replacement seats");

  if (seatNumbers && seats.length !== seatNumbers.length) {
    const found = seats.map((s) => s.seatNumber);
    throw new Error(`Unknown seat(s): ${seatNumbers.filter((n) => !found.includes(n)).join(", ")}`);
  }

  const now = new Date();
  const blocked = seats.filter((s) => {
    const mine = existing && String(s.bookedBy || "") === String(existing._id);
    return !mine && (s.isBooked || (s.lockedUntil && s.lockedUntil > now));
  });
  if (blocked.length) {
    throw new Error(`Seat(s) no longer free: ${blocked.map((s) => s.seatNumber).join(", ")} - choose others with --seats`);
  }
  const reserved = seats.filter((s) => s.isReserved);
  if (reserved.length) console.warn(`WARNING: reserved executive seat(s): ${reserved.map((s) => s.seatNumber).join(", ")}`);

  const tiers = [...new Set(seats.map((s) => s.table.type))];
  const base = seats.reduce((sum, s) => sum + s.table.pricePerSeat, 0);
  const expected = customerTotal(base);
  console.log(`Seats: ${seats.map((s) => s.seatNumber).join(", ")} (${tiers.join("/")}) - full price total ₦${expected}`);
  if (amountPaid + 1 < expected) {
    console.warn(
      `WARNING: paid ₦${amountPaid} < full price ₦${expected}. OK only if they had the engineering discount` +
        (existing?.discountApplied ? ` (original booking did: -₦${existing.discountAmount})` : "") +
        "."
    );
  }

  if (!apply) {
    console.log(`\nDry run only. Would ${existing ? `confirm existing booking ${existing._id}` : "create a new confirmed booking"}. Re-run with --apply to write.`);
    return mongoose.disconnect();
  }

  // 4. Write it, atomically
  const session = await mongoose.startSession();
  let booking;
  await session.withTransaction(async () => {
    const seatIds = seats.map((s) => s._id);
    const meals = existing?.meals?.length && !seatNumbers
      ? existing.meals
      : seatIds.map((id) => ({ seat: id, choice: getMealOptions(tiers[0])[0] }));

    booking = existing || new Booking({
      code: String(crypto.randomInt(100000, 1000000)),
      email: tx.customer.email.toLowerCase(),
      name: field("full_name") || tx.customer.email,
      matricNo: field("matric_no") || "N/A",
      phone: field("phone") || tx.customer.phone || "N/A",
      amount: base,
      totalAmount: amountPaid,
    });
    booking.seats = seatIds;
    booking.meals = meals;
    booking.status = "confirmed";
    booking.paymentVerified = true;
    booking.paystackRef = reference;
    booking.trxref = reference;
    await booking.save({ session });

    const res = await Seat.updateMany(
      { _id: { $in: seatIds }, $or: [{ isBooked: false }, { bookedBy: booking._id }] },
      { isBooked: true, bookedBy: booking._id, lockedUntil: null },
      { session }
    );
    if (res.matchedCount !== seatIds.length) throw new Error("A seat was taken while recovering - aborted, nothing written");

    for (const s of seats) {
      await Table.updateOne({ _id: s.table._id }, { $addToSet: { bookedSeats: s.seatNumber } }, { session });
    }
  });
  session.endSession();

  await logActivity("payment_recovered", `Recovered lost paid booking for ${booking.name} (${reference})`, {
    bookingId: String(booking._id),
    reference,
    amount: amountPaid,
  });
  console.log(`Confirmed booking ${booking._id} (entry code ${booking.code}).`);

  if (sendEmail) {
    const ok = await sendConfirmationEmail(booking);
    console.log(ok ? `Ticket emailed to ${booking.email}` : "Email FAILED - resend from admin");
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e?.response?.data || e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
