import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Executive reservation plan (password-gated, payable).
// VVIP: 12 round tables x 4 seats = 48 seats; reserve 42, leave 6 free.
// VIP:  6 long tables x 8 seats; reserve 11 seats.
const VVIP_TABLES = 12;
const VVIP_SEATS_PER_TABLE = 4;
const VVIP_PRICE = 30000;
const VVIP_RESERVE = 42;
const VIP_RESERVE = 11;

const tableNum = (table) => Number(String(table.tableNumber).split("-").pop());

const seatIndex = (seat) => Number(String(seat.seatNumber).split("-").pop().slice(1));

const ensureVvipTables = async () => {
  const existing = await Table.find({ type: "VVIP" }).lean();
  const have = new Set(existing.map((t) => tableNum(t)));

  for (let i = 1; i <= VVIP_TABLES; i++) {
    if (have.has(i)) continue;
    const tableNumber = `VVIP-${i}`;
    const table = await Table.create({
      tableNumber,
      type: "VVIP",
      shape: "ROUND",
      capacity: VVIP_SEATS_PER_TABLE,
      pricePerSeat: VVIP_PRICE,
    });
    const seatIds = [];
    for (let j = 1; j <= VVIP_SEATS_PER_TABLE; j++) {
      const seat = await Seat.create({
        seatNumber: `${tableNumber}-S${j}`,
        table: table._id,
      });
      seatIds.push(seat._id);
    }
    table.seats = seatIds;
    await table.save();
    console.log(`Created ${tableNumber} (${VVIP_SEATS_PER_TABLE} seats)`);
  }
};

const reserveType = async (type, count) => {
  const tables = (await Table.find({ type })).sort((a, b) => tableNum(a) - tableNum(b));
  const tableIds = tables.map((t) => t._id);

  // Reset any previous reservation / seeded hold for this tier.
  await Seat.updateMany(
    { table: { $in: tableIds } },
    { isBooked: false, isReserved: false, reservedFor: "" }
  );
  await Table.updateMany({ _id: { $in: tableIds } }, { bookedSeats: [] });

  const seats = await Seat.find({ table: { $in: tableIds } });
  seats.sort(
    (a, b) =>
      Number(String(a.seatNumber).split("-")[1]) - Number(String(b.seatNumber).split("-")[1]) ||
      seatIndex(a) - seatIndex(b)
  );

  const chosen = seats.slice(0, count);
  await Seat.updateMany(
    { _id: { $in: chosen.map((s) => s._id) } },
    { isReserved: true, reservedFor: "Executive" }
  );

  console.log(
    `Reserved ${chosen.length}/${count} ${type} seat(s) across ${tables.length} table(s)`
  );
  console.log(`  ${chosen.map((s) => s.seatNumber).join(", ")}`);
};

const run = async () => {
  try {
    const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"}`);

    const bookingCount = await Booking.countDocuments();
    if (bookingCount > 0) {
      console.error(
        `ABORTED: ${bookingCount} booking(s) exist. This script resets seat state.`
      );
      return;
    }

    await ensureVvipTables();
    await reserveType("VVIP", VVIP_RESERVE);
    await reserveType("VIP", VIP_RESERVE);

    const reserved = await Seat.countDocuments({ isReserved: true });
    const booked = await Seat.countDocuments({ isBooked: true });
    console.log(`Totals -> reserved: ${reserved}, booked: ${booked}`);
    console.log("Done.");
  } catch (error) {
    console.error("Error applying reservations:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
