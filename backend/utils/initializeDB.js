import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

const initializeDatabase = async () => {
    try {
        const tableCount = await Table.countDocuments()
        if(tableCount > 0) {
            console.log("Database already initialized");
            return
        }

        //Table configurations
           const tableConfigs = [
             {
               type: "VVIP",
               shape: "ROUND",
               tableCount: 8,
               seatsPerTable: 4,
               pricePerSeat: 40000,
             },
             {
               type: "VIP",
               shape: "MIXED",
               tableCount: 6,
               seatsPerTable: {
                 LONG: 8,
                 ROUND: 4,
               },
               pricePerSeat: 25000,
             },
             {
               type: "SILVER",
               shape: "ROUND",
               tableCount: 6,
               seatsPerTable: 5,
               pricePerSeat: 18000,
             },
             {
               type: "REGULAR",
               shape: "ROUND",
               tableCount: 84,
               seatsPerTable: 6,
               pricePerSeat: 8000,
             },
           ];

           for(const config of tableConfigs) {
            for(let i = 1; i <= config.tableCount; i++) {
              //Check table shape for VIP
              let tableShape = config.shape
              let seatsPerTable = config.seatsPerTable

              if (config.type === 'VIP') {
                tableShape = i <= 4 ? "LONG" : "ROUND";
                seatsPerTable =
                  tableShape === "LONG"
                    ? config.seatsPerTable.LONG
                    : config.seatsPerTable.ROUND;
              }

              //Create table
              const table = new Table({
                tableNumber: `${config.type}-${i}`,
                type: config.type,
                shape: tableShape,
                capacity: seatsPerTable,
                pricePerSeat: config.pricePerSeat
              });

              const savedTable = await table.save()

              //Make seats for the tables
              const seats = []
              for (let j = 1; j <= seatsPerTable; j++) {
                const seat = new Seat({
                  seatNumber: `${savedTable.tableNumber}-S${j}`,
                  table: savedTable._id
                });

                const savedSeat = await seat.save();
                seats.push(savedSeat._id)
              }

              //Update table
              savedTable.seats = seats
              await savedTable.save()
            }
           }
           console.log("Database initialized successfully");
           
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export default initializeDatabase
