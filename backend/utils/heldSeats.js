import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// READ-ONLY. Shows which seats on a table are held by unpaid (pending)
// reservations: who holds them, when they started, and whether a promo was used.
// Prints one "RELEASE_ID=<bookingId>" line per pending reservation so a wrapper
// can cancel them through the site's own cancel (which checks Paystack first).
//   node utils/heldSeats.js REGULAR-2
const tableNumber = String(process.argv[2] || "").toUpperCase();

const run = async () => {
  if (!tableNumber) {
    console.error("Usage: node utils/heldSeats.js <tableNumber, e.g. REGULAR-2>");
    process.exit(1);
  }
  await mongoose.connect(process.env.PROD_MONGO_URI || process.env.MONGO_URI);
  const table = await Table.findOne({ tableNumber });
  if (!table) throw new Error(`Table ${tableNumber} not found`);
  const seats = await Seat.find({ table: table._id });
  const now = new Date();
  const held = seats.filter((s) => !s.isBooked && s.lockedUntil && s.lockedUntil > now);
  console.log(`\n${tableNumber}: ${held.length} seat(s) held by unpaid reservations`);

  const pending = await Booking.find({ status: "pending", seats: { $in: held.map((s) => s._id) } }).populate("seats", "seatNumber");
  const ids = new Set();
  for (const b of pending) {
    ids.add(String(b._id));
    const mins = Math.round((now - b.createdAt) / 60000);
    console.log(
      `  ${b.seats.map((s) => s.seatNumber).join(", ")} <- ${b.name} <${b.email}> | started ${mins} min ago | total ${b.totalAmount}` +
        `${b.promoCode ? ` | promo ${b.promoCode}` : ""} | ref ${b.paystackRef}`
    );
  }
  for (const s of held) {
    if (!pending.some((b) => b.seats.some((x) => String(x._id) === String(s._id)))) {
      console.log(`  ${s.seatNumber} is locked until ${s.lockedUntil.toISOString()} with no pending booking behind it`);
    }
  }
  for (const id of ids) console.log(`RELEASE_ID=${id}`);
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
