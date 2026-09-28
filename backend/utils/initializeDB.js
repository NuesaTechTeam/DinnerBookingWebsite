import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

// Prices: Bronze (REGULAR) = ₦12,000 (₦10,000 with engineering invoice discount) | Gold (VIP) = ₦20,000 (₦18,000 with discount) | Platinum (VVIP) = ₦27,000
const tableConfigs = [
  {
    type: "VVIP",
    shape: "LONG",
    // 4 long banquet tables holding 25 Platinum seats in total
    capacities: [7, 6, 6, 6],
    pricePerSeat: 27000,
  },
  {
    type: "VIP",
    shape: "ROUND",
    // 16 Gold tables (one table seats 5, the rest seat 4)
    capacities: [5, ...Array(15).fill(4)],
    pricePerSeat: 20000,
  },
  {
    type: "REGULAR",
    shape: "ROUND",
    // 35 Bronze tables x 6 seats
    capacities: Array(35).fill(6),
    pricePerSeat: 12000,
  },
];

const initializeDatabase = async () => {
  try {
    console.log("starting population");

    const tableCount = await Table.countDocuments();
    if (tableCount > 0) {
      console.log("Database already initialized");
      return;
    }

    for (const config of tableConfigs) {
      for (let index = 0; index < config.capacities.length; index++) {
        const seatsPerTable = config.capacities[index];
        const tableNumber = `${config.type}-${index + 1}`;

        const table = new Table({
          tableNumber,
          type: config.type,
          shape: config.shape,
          capacity: seatsPerTable,
          pricePerSeat: config.pricePerSeat,
        });

        const savedTable = await table.save();
        console.log(`table ${tableNumber} saved`);

        // Create the seats for this table
        const seats = [];
        for (let j = 1; j <= seatsPerTable; j++) {
          const seat = new Seat({
            seatNumber: `${tableNumber}-S${j}`,
            table: savedTable._id,
          });

          const savedSeat = await seat.save();
          seats.push(savedSeat._id);
        }

        savedTable.seats = seats;
        await savedTable.save();
      }
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default initializeDatabase;
