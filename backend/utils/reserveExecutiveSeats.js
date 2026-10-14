import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Executive reservation plan (password-gated, payable).
// VVIP: 14 round tables x 4 seats = 56 seats; reserve 44, leave 12 free.
// VIP (Gold): reserve the whole of VIP-2, the first 4 seats of VIP-1, plus 6 seats on VIP-4.
const VVIP_TABLES = 14;
const VVIP_SEATS_PER_TABLE = 4;
const VVIP_PRICE = 30000;

const CONTIGUOUS = [{ type: "VVIP", reserve: 44 }];

// VIP (Gold) reservations: full table on VIP-2, first 4 seats on VIP-1, plus VIP-4.
// On VIP-4 the four seats in the bottom row (S5-S8) face the stage, so the
// majority of reserved seats face the stage; the other two (S1-S2) do not.
const VIP_TABLES = [
  { tableNumber: "VIP-2", seats: 8 },
  { tableNumber: "VIP-1", seats: 4 },
  { tableNumber: "VIP-4", seatNumbers: [1, 2, 5, 6, 7, 8] },
];

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

const resetType = async (type) => {
  const tables = await Table.find({ type }).lean();
  const tableIds = tables.map((t) => t._id);
  await Seat.updateMany(
    { table: { $in: tableIds } },
    { isBooked: false, isReserved: false, reservedFor: "" }
  );
  await Table.updateMany({ _id: { $in: tableIds } }, { bookedSeats: [] });
};

const reserveContiguous = async (type, count) => {
  const tables = (await Table.find({ type })).sort((a, b) => tableNum(a) - tableNum(b));
  const seats = await Seat.find({ table: { $in: tables.map((t) => t._id) } });
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
  console.log(`Reserved ${chosen.length}/${count} ${type} seat(s) (contiguous)`);
  console.log(`  ${chosen.map((s) => s.seatNumber).join(", ")}`);
};

const reserveTableSeats = async (tableNumber, count, seatNumbers) => {
  const table = await Table.findOne({ tableNumber });
  if (!table) {
    console.warn(`Table ${tableNumber} not found`);
    return;
  }

  let chosen;
  if (Array.isArray(seatNumbers)) {
    const seats = await Seat.find({ table: table._id });
    chosen = seatNumbers
      .map((n) => seats.find((s) => seatIndex(s) === n))
      .filter(Boolean);
  } else {
    const seats = (await Seat.find({ table: table._id })).sort(
      (a, b) => seatIndex(a) - seatIndex(b)
    );
    chosen = seats.slice(0, count);
  }

  await Seat.updateMany(
    { _id: { $in: chosen.map((s) => s._id) } },
    { isReserved: true, reservedFor: "Executive" }
  );
  console.log(`Reserved ${chosen.length} seat(s) on ${tableNumber}`);
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
    for (const { type } of CONTIGUOUS) await resetType(type);
    await resetType("VIP");
    for (const { type, reserve } of CONTIGUOUS) await reserveContiguous(type, reserve);
    for (const { tableNumber, seats, seatNumbers } of VIP_TABLES) {
      await reserveTableSeats(tableNumber, seats, seatNumbers);
    }

    for (const type of ["VVIP", "VIP"]) {
      const tables = await Table.find({ type }).lean();
      const c = await Seat.countDocuments({
        table: { $in: tables.map((t) => t._id) },
        isReserved: true,
      });
      console.log(`${type} reserved now: ${c}`);
    }
    console.log("Done.");
  } catch (error) {
    console.error("Error applying reservations:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
