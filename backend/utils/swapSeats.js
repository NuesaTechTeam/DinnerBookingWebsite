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

// Swaps who sits where, e.g. seats 3,4 <-> 7,8 on VIP-3.
// Whoever holds seat A moves to seat B and vice versa (an empty seat just
// stays empty on the other side). Bookings, meal choices, seat flags and the
// tables' bookedSeats lists all follow. Reserved-for-exec flags stay with the
// physical seat. DRY RUN unless --apply; --email re-sends each moved guest
// their ticket with the new seat.
//
//   node utils/swapSeats.js VIP-3 3:7,4:8 [--apply] [--email]
//
// Across tables, give full seat names. With --move every target (right-hand)
// seat must be empty, so nobody else is displaced:
//   node utils/swapSeats.js VVIP-14-S2:VVIP-6-S3,VVIP-12-S4:VVIP-6-S4 --move [--apply] [--email]

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const fullNames = (args[0] || "").includes(":");
const tableNumber = fullNames ? null : args[0];
const pairsArg = fullNames ? args[0] : args[1];
const apply = process.argv.includes("--apply");
const sendEmail = process.argv.includes("--email");
const moveOnly = process.argv.includes("--move");
const verb = moveOnly ? "move" : "swap";

const run = async () => {
  if (!pairsArg) {
    console.error(
      "Usage: node utils/swapSeats.js <tableNumber> <a:b,c:d> | <SEAT:SEAT,...> [--move] [--apply] [--email]"
    );
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}`);

  const seatName = (n) => (fullNames ? n.toUpperCase() : `${tableNumber}-S${n}`);
  const label = (n) => (fullNames ? seatName(n) : `Seat ${n}`);
  const pairs = pairsArg.split(",").map((p) => p.split(":").map((n) => n.trim()));
  const names = pairs.flat().map(seatName);
  if (new Set(names).size !== names.length) throw new Error("A seat appears twice in the list");

  const seats = await Seat.find({ seatNumber: { $in: names } }).populate("table");
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

  console.log(`\n${tableNumber ? `Table ${tableNumber}` : "Seats"} - planned ${verb}:`);
  for (const [a, b] of pairs) {
    const A = byName.get(seatName(a));
    const B = byName.get(seatName(b));
    console.log(`  ${label(a)}: ${who(A)}`);
    console.log(`     ${moveOnly ? " ->" : "<->"}  ${label(b)}: ${who(B)}`);
    if (moveOnly && B.isBooked) {
      throw new Error(`${B.seatNumber} is already taken by ${who(B)} - --move never displaces anyone`);
    }
    if (A.table?.type !== B.table?.type) {
      console.log(`     NOTE: different tiers (${A.table?.type} -> ${B.table?.type}); price and meal options differ`);
    }
    if (A.isReserved !== B.isReserved) {
      console.log(
        `     NOTE: reserved flag differs (${A.seatNumber} reserved=${A.isReserved}, ${B.seatNumber} reserved=${B.isReserved}); it stays with the physical seat`
      );
    }
  }
  // Seat `seat` after the swap holds `other`'s guest but keeps its own reserved flag
  const whoAfter = (seat, other) =>
    other.isBooked ? who(other) : `empty${seat.isReserved ? " (reserved for execs)" : ""}`;
  console.log(`\nAfter the ${verb}:`);
  for (const [a, b] of pairs) {
    const A = byName.get(seatName(a));
    const B = byName.get(seatName(b));
    console.log(`  ${label(a)}: ${whoAfter(A, B)}`);
    console.log(`  ${label(b)}: ${whoAfter(B, A)}`);
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

    // Rebuild each involved table's bookedSeats list from the seats themselves
    const tableIds = [...new Set(seats.map((s) => String(s.table._id)))];
    for (const tableId of tableIds) {
      const booked = await Seat.find({ table: tableId, isBooked: true }, "seatNumber", { session });
      await Table.updateOne({ _id: tableId }, { bookedSeats: booked.map((s) => s.seatNumber) }, { session });
    }
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
  console.log(`\n${moveOnly ? "Move" : "Swap"} applied.`);

  for (const booking of affected) {
    const fresh = await Booking.findById(booking._id).populate("seats");
    await logActivity(
      "seats_swapped",
      `${fresh.name} moved to ${fresh.seats.map((s) => s.seatNumber).join(", ")} (${
        tableNumber ? `table ${tableNumber} ` : ""
      }${verb} ${pairsArg})`,
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
