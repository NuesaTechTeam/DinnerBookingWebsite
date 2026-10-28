import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

// Prices: Bronze (REGULAR) = ₦12,000 (₦10,000 with engineering invoice discount) | Gold (VIP) = ₦20,000 (₦18,000 with discount) | Platinum (VVIP) = ₦30,000 (₦27,000 with engineering discount)
const tableConfigs = [
  // Current layout. Production was adjusted in place with
  // utils/adjustTables.js; this list only seeds an empty database.
  {
    type: "VVIP",
    shape: "ROUND",
    // 16 Platinum tables x 4 seats each (round); half render on each side.
    // Executive seats are password-gated via utils/reserveExecutiveSeats.js.
    capacities: Array(16).fill(4),
    pricePerSeat: 30000,
  },
  {
    type: "VIP",
    shape: "LONG",
    // 10 Gold tables x 8 seats each (long/banquet)
    capacities: Array(10).fill(8),
    pricePerSeat: 20000,
  },
  {
    type: "REGULAR",
    shape: "ROUND",
    // 34 Bronze tables x 6 seats each = 204 seats
    capacities: Array(34).fill(6),
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
      const reserved = new Set(config.reservedTableNumbers || []);

      for (let index = 0; index < config.capacities.length; index++) {
        const seatsPerTable = config.capacities[index];
        const tableNumber = `${config.type}-${index + 1}`;
        const isReserved = reserved.has(tableNumber);

        const table = new Table({
          tableNumber,
          type: config.type,
          shape: config.shape,
          capacity: seatsPerTable,
          pricePerSeat: config.pricePerSeat,
        });

        const savedTable = await table.save();
        console.log(`table ${tableNumber} saved${isReserved ? " (reserved)" : ""}`);

        // Create the seats for this table
        const seats = [];
        for (let j = 1; j <= seatsPerTable; j++) {
          const seat = new Seat({
            seatNumber: `${tableNumber}-S${j}`,
            table: savedTable._id,
            isBooked: isReserved,
          });

          const savedSeat = await seat.save();
          seats.push(savedSeat._id);
        }

        savedTable.seats = seats;
        if (isReserved) {
          savedTable.bookedSeats = seats.map((_, i) => `${tableNumber}-S${i + 1}`);
        }
        await savedTable.save();
      }
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default initializeDatabase;
