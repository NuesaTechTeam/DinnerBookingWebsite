import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";
import initializeDatabase from "../utils/initializeDB.js";

// Temporary one-time token used to wipe + reseed the production tables.
const ADMIN_RESET_TOKEN =
  "f7a3c9e21b8d4f60a5c2e8b1d9374f6a2c5e9b3d8f1a6c4e7b2d9f3a6c1e8b4";

export const resetTables = async (req, res) => {
  try {
    if (req.headers["x-admin-token"] !== ADMIN_RESET_TOKEN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const clearBookings = req.body?.clearBookings === true;

    await Seat.deleteMany({});
    await Table.deleteMany({});

    let bookingsDeleted = 0;
    if (clearBookings) {
      const result = await Booking.deleteMany({});
      bookingsDeleted = result.deletedCount;
    }

    await initializeDatabase();

    const tables = await Table.countDocuments();
    const seats = await Seat.countDocuments();

    res.status(200).json({
      success: true,
      message: "Tables reset and reseeded",
      tables,
      seats,
      bookingsDeleted,
    });
  } catch (error) {
    console.error("Reset tables error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
