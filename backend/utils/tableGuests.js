import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// READ-ONLY. Lists who sits on each seat of a table.
//   node utils/tableGuests.js VVIP-13
const tableNumber = String(process.argv[2] || "").toUpperCase();

const run = async () => {
  if (!tableNumber) {
    console.error("Usage: node utils/tableGuests.js <tableNumber, e.g. VVIP-13>");
    process.exit(1);
  }
  await mongoose.connect(process.env.PROD_MONGO_URI || process.env.MONGO_URI);
  const table = await Table.findOne({ tableNumber });
  if (!table) throw new Error(`Table ${tableNumber} not found`);

  const seats = (await Seat.find({ table: table._id })).sort(
    (a, b) => Number(a.seatNumber.split("-S").pop()) - Number(b.seatNumber.split("-S").pop())
  );
  const ids = seats.map((s) => s.bookedBy).filter(Boolean);
  const bookings = new Map((await Booking.find({ _id: { $in: ids } })).map((b) => [String(b._id), b]));

  console.log(`\n${tableNumber} (${table.type}, ${seats.length} seats):`);
  for (const s of seats) {
    const b = s.bookedBy && bookings.get(String(s.bookedBy));
    const meal = b?.meals?.find((m) => String(m.seat) === String(s._id))?.choice;
    console.log(
      `  Seat ${s.seatNumber.split("-S").pop()}: ` +
        (b
          ? `${b.name} <${b.email}> | ${b.phone} | #${b.code} [${b.status}${b.complimentary ? ", complimentary" : ""}]` +
            `${s.isGivenTicket ? " | CHECKED IN" : ""}${meal ? ` | meal: ${meal}` : ""}`
          : s.lockedUntil && s.lockedUntil > new Date()
          ? "held by someone paying right now"
          : `empty${s.isReserved ? " (reserved for execs)" : ""}`)
    );
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
