import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";

const syncExistingTables = async () => {
  try {
    console.log("starting syncing");
    const tables = await Table.find();

    for (const table of tables) {
      const bookedSeats = await Seat.find({
        table: table._id,
        isBooked: true,
      });

      const bookedSeatNumbers = bookedSeats.map((seat) => seat.seatNumber);

      table.bookedSeats = bookedSeatNumbers;
      await table.save();
    }

    console.log("Synced booked seats for existing tables");
  } catch (error) {
    console.error("Error syncing existing tables:", error);
  }
};

export default syncExistingTables
