import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Executive (VVIP) reservations: 18 seats (some couples take two).
// VIP reservations: 13 seats (includes Sharon + date, and kelvin adams x4).
const PLAN = [
  { type: "VVIP", count: 18 },
  { type: "VIP", count: 13 },
];

const reserveExecutiveSeats = async () => {
  try {
    const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log(
      `Connected to MongoDB ${process.env.PROD_MONGO_URI ? "(PROD)" : "(local)"}`
    );

    for (const { type, count } of PLAN) {
      const tables = await Table.find({ type })
        .sort({ tableNumber: 1 })
        .populate("seats");

      const reserved = [];
      for (const table of tables) {
        const seats = (table.seats || []).sort((a, b) =>
          String(a.seatNumber).localeCompare(String(b.seatNumber))
        );
        for (const seat of seats) {
          if (reserved.length >= count) break;
          if (seat.isBooked) continue;
          reserved.push(seat);
        }
        if (reserved.length >= count) break;
      }

      if (reserved.length < count) {
        console.warn(
          `Only ${reserved.length}/${count} free ${type} seat(s) available - reserving what exists.`
        );
      }

      const ids = reserved.map((s) => s._id);
      await Seat.updateMany(
        { _id: { $in: ids } },
        { isReserved: true, reservedFor: "Executive" }
      );
      console.log(
        `Reserved ${ids.length} ${type} seat(s): ${reserved
          .map((s) => s.seatNumber)
          .join(", ")}`
      );
    }

    const totalReserved = await Seat.countDocuments({
      isReserved: true,
      isBooked: false,
    });
    console.log(`Total reserved (still unpaid) seats now: ${totalReserved}`);
    console.log("Done.");
  } catch (error) {
    console.error("Error reserving executive seats:", error);
  } finally {
    await mongoose.disconnect();
  }
};

reserveExecutiveSeats();
