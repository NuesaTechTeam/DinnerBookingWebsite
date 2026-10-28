import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import "../models/seatModel.js";
import "../models/tableModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// READ-ONLY. Lists paid/pending reservations whose name or email matches.
//   node utils/findGuest.js daniel
const term = process.argv[2];

const run = async () => {
  if (!term) {
    console.error("Usage: node utils/findGuest.js <name or email fragment>");
    process.exit(1);
  }
  await mongoose.connect(process.env.PROD_MONGO_URI || process.env.MONGO_URI);
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const found = await Booking.find({ $or: [{ name: re }, { email: re }], status: { $ne: "cancelled" } })
    .populate({ path: "seats", populate: { path: "table" } })
    .sort({ createdAt: 1 });
  console.log(`Reservations matching "${term}": ${found.length}`);
  for (const b of found) {
    console.log(
      `  ${b.name} <${b.email}> #${b.code} [${b.status}] - ${b.seats.length} seat(s): ` +
        b.seats.map((s) => `${s.seatNumber} (${s.table?.type})`).join(", ")
    );
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
