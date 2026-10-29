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

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Creates a COMPLIMENTARY (free, organiser-approved) booking for one guest on
// one seat. It is confirmed and gets a normal ticket, but is labelled
// complimentary, records who approved it, takes no payment, and is kept out of
// revenue / seats-sold figures. DRY RUN unless --apply; --send-ticket emails it.
//
//   node utils/createComp.js --seat VVIP-8-S1 --name "Full Name" --email a@b.com
//     --approved-by "Technical Director" [--matric 22/ENG05/076] [--meal 1]
//     [--apply] [--send-ticket]
//
// --meal takes the option number (1, 2, ...) or the exact option text.

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const apply = process.argv.includes("--apply");
const sendTicket = process.argv.includes("--send-ticket");

const run = async () => {
  const seatNumber = String(arg("seat") || "").toUpperCase();
  const name = String(arg("name") || "").trim();
  const email = String(arg("email") || "").trim().toLowerCase();
  const approvedBy = String(arg("approved-by") || "").trim();
  const matricNo = String(arg("matric") || "N/A").trim().toUpperCase();
  const mealArg = arg("meal") || "1";

  if (!seatNumber || !name || !validator.isEmail(email) || !approvedBy) {
    console.error(
      'Usage: node utils/createComp.js --seat VVIP-8-S1 --name "Full Name" --email a@b.com --approved-by "Role" [--matric X] [--meal 1] [--apply] [--send-ticket]'
    );
    process.exit(1);
  }

  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);

  const seat = await Seat.findOne({ seatNumber }).populate("table");
  if (!seat) throw new Error(`Seat ${seatNumber} not found`);
  if (seat.isBooked || seat.bookedBy) throw new Error(`${seatNumber} is already booked`);
  if (seat.lockedUntil && seat.lockedUntil > new Date()) {
    throw new Error(`${seatNumber} is being held by someone paying right now - try again later`);
  }

  const options = getMealOptions(seat.table.type);
  const meal = /^\d+$/.test(mealArg) ? options[Number(mealArg) - 1] : options.find((o) => o === mealArg);
  if (!meal) throw new Error(`Meal "${mealArg}" is not an option for ${seat.table.type}: ${options.join(" | ")}`);

  console.log(
    `${apply ? "APPLY" : "DRY RUN"} (${uri.includes("mongodb+srv") ? "PROD" : "local"}): COMPLIMENTARY ${seatNumber}` +
      ` (${seat.table.type}${seat.isReserved ? ", reserved for execs" : ""}) -> ${name} <${email}>` +
      ` | matric ${matricNo} | meal: ${meal} | approved by ${approvedBy}`
  );

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
        phone: "N/A",
        amount: 0,
        totalAmount: 0,
        status: "confirmed",
        paymentVerified: false, // no payment was taken
        complimentary: true,
        compApprovedBy: approvedBy,
        seats: [seat._id],
        meals: [{ seat: seat._id, choice: meal }],
      }],
      { session }
    );
    const res = await Seat.updateOne(
      { _id: seat._id, isBooked: { $ne: true } },
      { isBooked: true, bookedBy: booking._id, lockedUntil: null },
      { session }
    );
    if (res.matchedCount !== 1) throw new Error(`${seatNumber} was taken a moment ago - nothing written`);
    await Table.updateOne({ _id: seat.table._id }, { $addToSet: { bookedSeats: seatNumber } }, { session });
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
    "complimentary_booking",
    `Complimentary ${seatNumber} for ${name} <${email}>, approved by ${approvedBy} [${booking._id}]`,
    { bookingId: String(booking._id), approvedBy }
  );
  console.log(`  Created complimentary booking #${booking.code} for ${name} on ${seatNumber}`);

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
