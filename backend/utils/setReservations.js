import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Opens every reserved seat to the public EXCEPT on the listed tables, whose
// empty seats become reserved for one group (e.g. Lecturers - never bookable
// online, not even with the executive access code). Booked seats are never
// touched. DRY RUN unless --apply.
//
//   node utils/setReservations.js --keep VVIP-5,VVIP-9,VVIP-10,VVIP-11 --for Lecturers [--apply]

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const keep = String(arg("keep") || "").split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
const group = String(arg("for") || "").trim();
const apply = process.argv.includes("--apply");

const run = async () => {
  if (!keep.length || !group) {
    console.error("Usage: node utils/setReservations.js --keep TABLE,TABLE --for Lecturers [--apply]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}\n`);

  const keepTables = await Table.find({ tableNumber: { $in: keep } });
  const missing = keep.filter((t) => !keepTables.some((k) => k.tableNumber === t));
  if (missing.length) throw new Error(`Table(s) not found: ${missing.join(", ")}`);
  const keepIds = keepTables.map((t) => t._id);

  // 1. Reserved seats elsewhere that will open up (empty ones are what matters)
  const toOpen = await Seat.find({ isReserved: true, table: { $nin: keepIds } }).populate("table", "tableNumber type");
  const byTable = {};
  for (const s of toOpen) {
    const k = s.table.tableNumber;
    (byTable[k] ||= { empty: [], booked: 0 });
    if (s.isBooked) byTable[k].booked++;
    else byTable[k].empty.push(s.seatNumber.split("-S").pop());
  }
  const emptyOpening = toOpen.filter((s) => !s.isBooked).length;
  console.log(`OPEN TO THE PUBLIC: ${emptyOpening} empty reserved seat(s) on ${Object.keys(byTable).length} table(s)`);
  for (const [t, v] of Object.entries(byTable).sort()) {
    if (v.empty.length) console.log(`  ${t}: seat(s) ${v.empty.join(", ")}`);
  }

  // 2. The kept tables: every empty seat becomes reserved for the group
  const keepSeats = await Seat.find({ table: { $in: keepIds } }).populate("table", "tableNumber");
  console.log(`\nRESERVED FOR ${group.toUpperCase()} (access code will NOT unlock them):`);
  for (const t of keepTables) {
    const seats = keepSeats.filter((s) => String(s.table._id) === String(t._id));
    const booked = seats.filter((s) => s.isBooked);
    console.log(
      `  ${t.tableNumber}: ${seats.length - booked.length} empty seat(s) locked` +
        (booked.length ? ` | already booked, left as is: ${booked.map((s) => s.seatNumber).join(", ")}` : "")
    );
  }

  if (!apply) {
    console.log("\nDry run only - nothing changed. Re-run with --apply.");
    return mongoose.disconnect();
  }

  const opened = await Seat.updateMany(
    { isReserved: true, table: { $nin: keepIds } },
    { isReserved: false, reservedFor: "" }
  );
  const locked = await Seat.updateMany(
    { table: { $in: keepIds }, isBooked: { $ne: true } },
    { isReserved: true, reservedFor: group }
  );
  await logActivity(
    "reservations_changed",
    `Opened ${emptyOpening} reserved seat(s) to the public; ${keep.join(", ")} reserved for ${group}`
  );
  console.log(`\nApplied: ${opened.modifiedCount} seat(s) un-reserved, ${locked.matchedCount} seat(s) on ${keep.join(", ")} reserved for ${group}.`);
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
