import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";

dotenv.config();

// Bronze (REGULAR) = ₦10,000 | Gold (VIP) = ₦18,000 | Platinum (VVIP) = ₦27,000
const PRICE_PER_SEAT = {
  REGULAR: 10000,
  SILVER: 18000,
  VIP: 18000,
  VVIP: 27000,
};

const updateTablePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const tables = await Table.find();
    let updated = 0;

    for (const table of tables) {
      const price = PRICE_PER_SEAT[table.type];
      if (price && table.pricePerSeat !== price) {
        table.pricePerSeat = price;
        await table.save();
        updated++;
        console.log(`${table.tableNumber} (${table.type}) -> ₦${price}`);
      }
    }

    console.log(`Done. Updated ${updated} of ${tables.length} table(s).`);
  } catch (error) {
    console.error("Error updating table prices:", error);
  } finally {
    await mongoose.disconnect();
  }
};

updateTablePrices();
