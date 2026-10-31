import dns from "dns";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";
import validator from "validator";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";
import { getMealOptions } from "./meals.js";
import { sendConfirmationEmail } from "./emailService.js";
import { logActivity } from "./activity.js";
import { customerTotal } from "./pricing.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Creates a COMPLIMENTARY (free, organiser-approved) booking for one guest on
// one or more seats. It is confirmed and gets a normal ticket (one booking =
// one QR code listing every seat), is labelled complimentary, records who
// approved it, takes no payment, and is kept out of revenue / seats-sold
// figures. DRY RUN unless --apply; --send-ticket emails it.
//
//   node utils/createComp.js --seat VVIP-8-S1 --name "Full Name" --email a@b.com
//     --approved-by "Technical Director" [--matric 22/ENG05/076] [--meal 1]
//     [--apply] [--send-ticket]
//
// --pass N issues a seat-less ENTRY PASS for N guests (e.g. performers): complimentary, no seat or
// table, one QR code, checked in once at the door. Use it instead of --seat / --table.
//
// --paid records a guest who ALREADY PAID but whose booking failed: a normal confirmed
// ticket that counts in revenue and seats sold (not complimentary). The amount is the
// seat price unless --amount is given; --phone sets the guest's phone number.
//
// Several seats: --seat VIP-3-S1,VIP-3-S2   or let it pick free seats from a
// table: --table REGULAR-10 --count 3 (lowest-numbered free seats first).
// --meal takes the option number (1, 2, ...) or the exact option text and is
// used for every seat. Closed tiers (config/closedTiers.js) can still be
// seated this way: organisers are not the public.

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const apply = process.argv.includes("--apply");
const sendTicket = process.argv.includes("--send-ticket");
const paid = process.argv.includes("--paid");
const passCount = Number(arg("pass") || 0);

const seatIndex = (s) => Number(String(s.seatNumber).split("-S").pop());

const run = async () => {
  const seatArg = String(arg("seat") || "").toUpperCase();
  const tableArg = String(arg("table") || "").toUpperCase();
  const count = Number(arg("count") || 0);
  const name = String(arg("name") || "").trim();
  const email = String(arg("email") || "").trim().toLowerCase();
  const approvedBy = String(arg("approved-by") || "").trim();
  const matricNo = String(arg("matric") || "N/A").trim().toUpperCase();
  const mealArg = arg("meal") || "1";
  const phone = String(arg("phone") || "N/A").trim();
  const amountArg = Number(arg("amount"));

  if ((!seatArg && !(tableArg && count > 0) && !(passCount > 0)) || !name || !validator.isEmail(email) || !approvedBy) {
    console.error(
      'Usage: node utils/createComp.js (--seat A,B | --table TABLE --count N) --name "Full Name" --email a@b.com --approved-by "Role" [--matric X] [--meal 1] [--apply] [--send-ticket]'
    );
    process.exit(1);
  }

  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);

  let seats = [];
  if (passCount > 0) {
    // seat-less entry pass: no seats to look up
  } else if (seatArg) {
    const wanted = seatArg.split(",").map((s) => s.trim()).filter(Boolean);
    if (new Set(wanted).size !== wanted.length) throw new Error("A seat is listed twice");
    seats = await Seat.find({ seatNumber: { $in: wanted } }).populate("table");
    const missing = wanted.filter((n) => !seats.some((s) => s.seatNumber === n));
    if (missing.length) throw new Error(`Seat(s) not found: ${missing.join(", ")}`);
    seats.sort((a, b) => wanted.indexOf(a.seatNumber) - wanted.indexOf(b.seatNumber));
  } else {
    const table = await Table.findOne({ tableNumber: tableArg });
    if (!table) throw new Error(`Table ${tableArg} not found`);
    const all = (await Seat.find({ table: table._id }).populate("table")).sort((a, b) => seatIndex(a) - seatIndex(b));
    const now0 = new Date();
    const free = all.filter((s) => !s.isBooked && !s.bookedBy && !(s.lockedUntil && s.lockedUntil > now0));
    console.log(`${tableArg}: ${free.length} free seat(s) of ${all.length} (free: ${free.map((s) => seatIndex(s)).join(", ") || "none"})`);
    if (free.length < count) throw new Error(`${tableArg} only has ${free.length} free seat(s); can't give ${count}`);
    seats = free.slice(0, count);
  }

  const now = new Date();
  for (const seat of seats) {
    if (seat.isBooked || seat.bookedBy) throw new Error(`${seat.seatNumber} is already booked`);
    if (seat.lockedUntil && seat.lockedUntil > now) {
      throw new Error(`${seat.seatNumber} is being held by someone paying right now - try again later`);
    }
  }
  const tiers = [...new Set(seats.map((s) => s.table.type))];
  if (passCount === 0 && tiers.length > 1) throw new Error(`Seats are in different tiers (${tiers.join(", ")}); book each tier separately`);

  const options = passCount > 0 ? [] : getMealOptions(tiers[0]);
  const meal = passCount > 0 ? "" : /^\d+$/.test(mealArg) ? options[Number(mealArg) - 1] : options.find((o) => o === mealArg);
  if (passCount === 0 && !meal) throw new Error(`Meal "${mealArg}" is not an option for ${tiers[0]}: ${options.join(" | ")}`);

  const mode = `${apply ? "APPLY" : "DRY RUN"} (${uri.includes("mongodb+srv") ? "PROD" : "local"})`;
  if (passCount > 0) {
    console.log(`${mode}: COMPLIMENTARY ENTRY PASS for ${passCount} guest(s), no seat or table -> ${name} <${email}> | approved by ${approvedBy}`);
  } else {
    console.log(
      `${mode}: ${paid ? "PAID (recorded manually)" : "COMPLIMENTARY"} ${seats.length} seat(s) ` +
        `${seats.map((s) => s.seatNumber).join(", ")} (${tiers[0]}${seats.some((s) => s.isReserved) ? ", some reserved" : ""})` +
        ` -> ${name} <${email}> | matric ${matricNo} | meal (each seat): ${meal} | approved by ${approvedBy}`
    );
  }

  const paidAmount = paid ? (amountArg > 0 ? amountArg : seats.reduce((n, s) => n + (s.table.pricePerSeat || 0), 0)) : 0;
  if (paid) console.log(`  Recorded as paid: seat price ₦${paidAmount.toLocaleString()}, total with fee ₦${customerTotal(paidAmount).toLocaleString()}`);
  if (!apply) return mongoose.disconnect();

  let code;
  for (let i = 0; i < 30; i++) {
    const c = String(crypto.randomInt(100000, 1000000));
    if (!(await Booking.exists({ code: c }))) { code = c; break; }
  }

  const doIt = async (session) => {
    const [booking] = await Booking.create(
      [{
        code,
        email,
        name,
        matricNo,
        phone,
        amount: paid ? paidAmount : 0,
        totalAmount: paid ? customerTotal(paidAmount) : 0,
        status: "confirmed",
        paymentVerified: paid, // complimentary seats take no payment
        complimentary: !paid,
        compApprovedBy: approvedBy,
        manualPayment: paid,
        entryPass: passCount > 0,
        passCount: passCount > 0 ? passCount : 0,
        manualNote: paid ? `Paid on Paystack but the booking failed; recorded manually (${approvedBy})` : undefined,
        seats: seats.map((s) => s._id),
        meals: seats.map((s) => ({ seat: s._id, choice: meal })),
      }],
      { session }
    );
    const res = await Seat.updateMany(
      { _id: { $in: seats.map((s) => s._id) }, isBooked: { $ne: true } },
      { isBooked: true, bookedBy: booking._id, lockedUntil: null },
      { session }
    );
    if (res.matchedCount !== seats.length) throw new Error("A seat was taken a moment ago - nothing written");
    for (const s of seats) {
      await Table.updateOne({ _id: s.table._id }, { $addToSet: { bookedSeats: s.seatNumber } }, { session });
    }
    return booking;
  };

  let booking;
  if (process.env.LOCAL_NO_TXN === "1") {
    if (!uri.startsWith("mongodb://127.0.0.1")) throw new Error("LOCAL_NO_TXN is for local testing only");
    booking = await doIt(null);
  } else {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => { booking = await doIt(session); });
    session.endSession();
  }

  await logActivity(
    paid ? "manual_paid_booking" : "complimentary_booking",
    `${paid ? "Paid booking recorded manually" : passCount > 0 ? `Entry pass (${passCount} guests, no seat)` : "Complimentary"} ${seats.map((s) => s.seatNumber).join(", ")} for ${name} <${email}>, approved by ${approvedBy} [${booking._id}]`,
    { bookingId: String(booking._id), approvedBy }
  );
  console.log(`  Created ${paid ? "paid" : passCount > 0 ? "entry pass" : "complimentary"} booking #${booking.code} for ${name}${passCount > 0 ? ` (${passCount} guests, no seat)` : `: ${seats.map((s) => s.seatNumber).join(", ")}`}`);

  if (sendTicket) {
    const fresh = await Booking.findById(booking._id);
    const ok = await sendConfirmationEmail(fresh);
    console.log(`  ${ok ? "Ticket emailed to" : "EMAIL FAILED for"} ${email}`);
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
