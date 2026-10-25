import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";
import { sendConfirmationEmail } from "./emailService.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Swaps who sits where on one table, e.g. seats 3,4 <-> 7,8 on VIP-3.
// Whoever holds seat A moves to seat B and vice versa (an empty seat just
// stays empty on the other side). Bookings, meal choices, seat flags and the
// table's bookedSeats list all follow. Reserved-for-exec flags stay with the
// physical seat. DRY RUN unless --apply; --email re-sends each moved guest
// their ticket with the new seat.
//
//   node utils/swapSeats.js VIP-3 3:7,4:8 [--apply] [--email]

const [tableNumber, pairsArg] = process.argv.slice(2);
const apply = process.argv.includes("--apply");
const sendEmail = process.argv.includes("--email");

const run = async () => {
  if (!tableNumber || !pairsArg || pairsArg.startsWith("--")) {
    console.error("Usage: node utils/swapSeats.js <tableNumber> <a:b,c:d> [--apply] [--email]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}`);

  const table = await Table.findOne({ tableNumber });
  if (!table) throw new Error(`Table ${tableNumber} not found`);

  const seatName = (n) => `${tableNumber}-S${n}`;
  const pairs = pairsArg.split(",").map((p) => p.split(":").map((n) => n.trim()));
  const names = pairs.flat().map(seatName);
  if (new Set(names).size !== names.length) throw new Error("A seat appears twice in the swap list");

  const seats = await Seat.find({ table: table._id, seatNumber: { $in: names } });
  const byName = new Map(seats.map((s) => [s.seatNumber, s]));
  const missing = names.filter((n) => !byName.has(n));
  if (missing.length) throw new Error(`Seat(s) not found: ${missing.join(", ")}`);

  const owners = new Map(); // bookingId -> booking
  for (const s of seats) {
    if (s.lockedUntil && s.lockedUntil > new Date() && !s.isBooked) {
      throw new Error(`${s.seatNumber} is held by an unpaid reservation right now - try again later`);
    }
    if (s.isGivenTicket) throw new Error(`${s.seatNumber} is already checked in - not moving it`);
    if (s.isBooked && s.bookedBy && !owners.has(String(s.bookedBy))) {
      owners.set(String(s.bookedBy), await Booking.findById(s.bookedBy));
    }
  }

  const who = (s) => {
    if (!s.isBooked) return `empty${s.isReserved ? " (reserved for execs)" : ""}`;
    const b = owners.get(String(s.bookedBy));
    return b ? `${b.name} <${b.email}> #${b.code} [${b.status}]` : `booked by missing booking ${s.bookedBy}`;
  };

  console.log(`\nTable ${tableNumber} - planned swap:`);
  for (const [a, b] of pairs) {
    const A = byName.get(seatName(a));
    const B = byName.get(seatName(b));
    console.log(`  Seat ${a}: ${who(A)}`);
    console.log(`     <->  Seat ${b}: ${who(B)}`);
    if (A.isReserved !== B.isReserved) {
      console.log(`     NOTE: reserved flag differs (seat ${a} reserved=${A.isReserved}, seat ${b} reserved=${B.isReserved}); it stays with the physical seat`);
    }
  }
  console.log("\nAfter the swap:");
  for (const [a, b] of pairs) {
    console.log(`  Seat ${a}: ${who(byName.get(seatName(b)))}`);
    console.log(`  Seat ${b}: ${who(byName.get(seatName(a)))}`);
  }
  const affected = [...owners.values()].filter(Boolean);
  console.log(`\nGuests whose seat changes: ${affected.map((b) => `${b.name} <${b.email}>`).join("; ") || "none"}`);

  if (!apply) {
    console.log("\nDry run only - nothing changed. Re-run with --apply (and --email to send new tickets).");
    return mongoose.disconnect();
  }

  const doSwap = async (session) => {
    const swapMap = new Map(); // seatId -> the seat id it becomes
    for (const [a, b] of pairs) {
      const A = byName.get(seatName(a));
      const B = byName.get(seatName(b));
      swapMap.set(String(A._id), B._id);
      swapMap.set(String(B._id), A._id);

      const occA = { isBooked: A.isBooked, bookedBy: A.bookedBy || null, lockedUntil: A.lockedUntil };
      const occB = { isBooked: B.isBooked, bookedBy: B.bookedBy || null, lockedUntil: B.lockedUntil };
      await Seat.updateOne({ _id: A._id }, occB, { session });
      await Seat.updateOne({ _id: B._id }, occA, { session });
    }

    for (const booking of affected) {
      const b = await Booking.findById(booking._id).session(session);
      b.seats = b.seats.map((id) => swapMap.get(String(id)) || id);
      b.meals = (b.meals || []).map((m) => ({
        seat: swapMap.get(String(m.seat)) || m.seat,
        choice: m.choice,
      }));
      await b.save({ session });
    }

    // Rebuild the table's bookedSeats list from the seats themselves
    const booked = await Seat.find({ table: table._id, isBooked: true }, "seatNumber", { session });
    await Table.updateOne({ _id: table._id }, { bookedSeats: booked.map((s) => s.seatNumber) }, { session });
  };

  // Atlas runs this atomically. A standalone local MongoDB has no transactions,
  // so local testing can opt out with LOCAL_NO_TXN=1 (refused against prod).
  if (process.env.LOCAL_NO_TXN === "1") {
    if (!uri.startsWith("mongodb://127.0.0.1")) throw new Error("LOCAL_NO_TXN is for local testing only");
    await doSwap(null);
  } else {
    const session = await mongoose.startSession();
    await session.withTransaction(() => doSwap(session));
    session.endSession();
  }
  console.log("\nSwap applied.");

  for (const booking of affected) {
    const fresh = await Booking.findById(booking._id).populate("seats");
    await logActivity(
      "seats_swapped",
      `${fresh.name} moved to ${fresh.seats.map((s) => s.seatNumber).join(", ")} (table ${tableNumber} swap ${pairsArg})`,
      { bookingId: String(fresh._id) }
    );
    console.log(`  ${fresh.name}: now ${fresh.seats.map((s) => s.seatNumber).join(", ")}`);
    if (sendEmail && fresh.status === "confirmed") {
      const ok = await sendConfirmationEmail(fresh);
      console.log(`    ${ok ? "New ticket emailed to" : "EMAIL FAILED for"} ${fresh.email}`);
    }
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
