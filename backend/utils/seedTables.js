import mongoose from "mongoose";
import dotenv from "dotenv";
import initializeDatabase from "./initializeDB.js";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

dotenv.config();

const reset = process.argv.includes("--reset");

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    if (reset) {
      await Seat.deleteMany({});
      await Table.deleteMany({});
      console.log("Cleared existing tables and seats");
    }

    await initializeDatabase();
  } catch (error) {
    console.error("Error seeding tables:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedTables();
