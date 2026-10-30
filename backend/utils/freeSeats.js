import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// READ-ONLY. Shows the empty seats on every table of a tier and suggests a
// table with exactly one seat left (lowest table number first).
//   node utils/freeSeats.js VVIP [--exclude VVIP-13]
const type = String(process.argv[2] || "").toUpperCase();
const exIdx = process.argv.indexOf("--exclude");
const exclude = exIdx > -1 ? String(process.argv[exIdx + 1]).toUpperCase() : "";

const run = async () => {
  if (!type) {
    console.error("Usage: node utils/freeSeats.js <VVIP|VIP|REGULAR> [--exclude TABLE]");
    process.exit(1);
  }
  await mongoose.connect(process.env.PROD_MONGO_URI || process.env.MONGO_URI);
  const num = (s) => Number(String(s).split("-").pop().replace("S", ""));
  const tables = (await Table.find({ type })).sort((a, b) => num(a.tableNumber) - num(b.tableNumber));
  const now = new Date();
  let suggestion = "";

  console.log(`\nEmpty seats on ${type} tables:`);
  for (const t of tables) {
    const seats = await Seat.find({ table: t._id });
    const empty = seats
      .filter((s) => !s.isBooked && !s.bookedBy && !(s.lockedUntil && s.lockedUntil > now))
      .sort((a, b) => num(a.seatNumber) - num(b.seatNumber));
    const label = empty.length
      ? empty.map((s) => `S${num(s.seatNumber)}${s.isReserved ? " (exec-reserved)" : ""}`).join(", ")
      : "full";
    console.log(`  ${t.tableNumber}: ${empty.length}/${seats.length} empty - ${label}`);
    if (!suggestion && empty.length === 1 && t.tableNumber !== exclude) suggestion = empty[0].seatNumber;
  }
  console.log(suggestion ? `\nSUGGEST=${suggestion}` : "\nSUGGEST=");
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
