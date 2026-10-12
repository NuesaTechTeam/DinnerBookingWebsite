import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";
import initializeDatabase from "./initializeDB.js";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const applySeatingPlan = async () => {
  try {
    const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const bookingCount = await Booking.countDocuments();
    if (bookingCount > 0) {
      console.error(
        `ABORTED: ${bookingCount} booking(s) still exist. Delete bookings before re-seeding to avoid orphaning seats.`
      );
      return;
    }

    const deletedTables = await Table.deleteMany({});
    const deletedSeats = await Seat.deleteMany({});
    console.log(
      `Cleared ${deletedTables.deletedCount} table(s) and ${deletedSeats.deletedCount} seat(s)`
    );

    await initializeDatabase();

    const summary = await Table.aggregate([
      { $group: { _id: "$type", tables: { $sum: 1 }, seats: { $sum: "$capacity" } } },
      { $sort: { _id: 1 } },
    ]);
    console.log("New layout:", JSON.stringify(summary, null, 2));
    console.log("Done.");
  } catch (error) {
    console.error("Error applying seating plan:", error);
  } finally {
    await mongoose.disconnect();
  }
};

applySeatingPlan();
