import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Seat } from "../models/seatModel.js";
import "../models/tableModel.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Reserves every seat of a tier that is still free, so the public can't book
// it any more. Seats already booked, already reserved (e.g. lecturer tables)
// or being paid for right now are left alone. DRY RUN unless --apply.
//
//   node utils/reserveAvailable.js --type VVIP [--for Executive] [--apply]
//
// "Executive" seats can still be booked with the executive access code;
// use --for Lecturers for seats nobody can book online.

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const type = String(arg("type") || "").toUpperCase();
const group = String(arg("for") || "Executive").trim();
const apply = process.argv.includes("--apply");

const run = async () => {
  if (!["VVIP", "VIP", "REGULAR"].includes(type)) {
    console.error("Usage: node utils/reserveAvailable.js --type VVIP|VIP|REGULAR [--for Executive|Lecturers] [--apply]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}\n`);

  const num = (s) => Number(String(s).split("-").pop().replace("S", ""));
  const seats = (await Seat.find().populate("table", "tableNumber type")).filter((s) => s.table?.type === type);
  const now = new Date();
  const free = [], held = [];
  let booked = 0, alreadyReserved = 0;
  for (const s of seats) {
    if (s.isBooked || s.bookedBy) booked++;
    else if (s.isReserved) alreadyReserved++;
    else if (s.lockedUntil && s.lockedUntil > now) held.push(s);
    else free.push(s);
  }

  const byTable = {};
  for (const s of free) (byTable[s.table.tableNumber] ||= []).push(num(s.seatNumber));
  const tables = Object.keys(byTable).sort((a, b) => num(a) - num(b));
  console.log(`${type}: ${seats.length} seats | ${booked} booked | ${alreadyReserved} already reserved | ${held.length} being paid for right now | ${free.length} free`);
  console.log(`\nWill reserve ${free.length} free seat(s) for ${group}:`);
  for (const t of tables) console.log(`  ${t}: seat(s) ${byTable[t].sort((a, b) => a - b).join(", ")}`);
  if (held.length) console.log(`\nSkipped (someone is paying for them): ${held.map((s) => s.seatNumber).join(", ")} - run this again later to catch them if they come free`);

  if (!apply) {
    console.log("\nDry run only - nothing changed. Re-run with --apply.");
    return mongoose.disconnect();
  }
  const res = await Seat.updateMany(
    { _id: { $in: free.map((s) => s._id) }, isBooked: { $ne: true }, isReserved: { $ne: true } },
    { isReserved: true, reservedFor: group }
  );
  await logActivity("reservations_changed", `Reserved ${res.modifiedCount} free ${type} seat(s) for ${group}`);
  console.log(`\nApplied: ${res.modifiedCount} seat(s) reserved for ${group}.`);
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
