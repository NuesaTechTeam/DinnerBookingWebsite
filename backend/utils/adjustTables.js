import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Table } from "../models/tableModel.js";
import { Seat } from "../models/seatModel.js";
import { Booking } from "../models/bookingModel.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Adds tables to a tier or removes its highest-numbered tables, without
// touching any booking. Removal refuses if any seat on those tables is
// booked, held by an unpaid reservation, or listed on any reservation.
// DRY RUN unless --apply.
//
//   node utils/adjustTables.js --add VVIP:2 --add VIP:4 --remove REGULAR:6 [--apply]

// Shape, seats per table and price for new tables in each tier
const TIER = {
  VVIP: { shape: "ROUND", capacity: 4, pricePerSeat: 30000, label: "Platinum" },
  VIP: { shape: "LONG", capacity: 8, pricePerSeat: 20000, label: "Gold" },
  REGULAR: { shape: "ROUND", capacity: 6, pricePerSeat: 12000, label: "Bronze" },
};

const apply = process.argv.includes("--apply");
const ops = [];
process.argv.forEach((arg, i) => {
  if (arg === "--add" || arg === "--remove") {
    const [type, n] = String(process.argv[i + 1] || "").split(":");
    ops.push({ kind: arg.slice(2), type: type.toUpperCase(), count: Number(n) });
  }
});

const num = (t) => Number(String(t.tableNumber).split("-").pop());
const sides = (tables) => {
  const sorted = [...tables].sort((a, b) => a - b);
  const mid = Math.ceil(sorted.length / 2);
  return { left: sorted.slice(0, mid), right: sorted.slice(mid) };
};
const range = (list) => (list.length ? `${list[0]}-${list[list.length - 1]}` : "none");

const run = async () => {
  if (!ops.length || ops.some((o) => !TIER[o.type] || !(o.count > 0))) {
    console.error("Usage: node utils/adjustTables.js --add VVIP:2 --remove REGULAR:6 [--apply]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}\n`);

  const plan = [];
  for (const op of ops) {
    const cfg = TIER[op.type];
    const tables = (await Table.find({ type: op.type })).sort((a, b) => num(a) - num(b));
    const before = tables.map(num);

    if (op.kind === "add") {
      const start = (before[before.length - 1] || 0) + 1;
      const newNums = Array.from({ length: op.count }, (_, i) => start + i);
      const clash = await Table.find({ tableNumber: { $in: newNums.map((n) => `${op.type}-${n}`) } });
      if (clash.length) throw new Error(`Table(s) already exist: ${clash.map((t) => t.tableNumber).join(", ")}`);
      plan.push({ ...op, cfg, before, after: [...before, ...newNums], newNums });
      console.log(
        `ADD ${op.count} ${cfg.label} (${op.type}) table(s): ${newNums.map((n) => `${op.type}-${n}`).join(", ")}` +
          ` - ${cfg.capacity} seats each, ${cfg.shape.toLowerCase()}, ₦${cfg.pricePerSeat.toLocaleString()}/seat`
      );
    } else {
      if (op.count >= tables.length) throw new Error(`Can't remove ${op.count} of ${tables.length} ${op.type} tables`);
      const doomed = tables.slice(-op.count);
      const seats = await Seat.find({ table: { $in: doomed.map((t) => t._id) } });
      const now = new Date();
      const problems = seats.filter(
        (s) => s.isBooked || s.bookedBy || (s.lockedUntil && s.lockedUntil > now) || s.isGivenTicket
      );
      const onBookings = await Booking.find({ seats: { $in: seats.map((s) => s._id) } }, "name status");
      if (problems.length || onBookings.length) {
        throw new Error(
          `Not removing ${doomed.map((t) => t.tableNumber).join(", ")}: seat(s) in use ` +
            `(${problems.map((s) => s.seatNumber).join(", ") || "-"}; reservations: ${
              onBookings.map((b) => `${b.name} [${b.status}]`).join(", ") || "-"
            }). Move those guests first.`
        );
      }
      const reserved = seats.filter((s) => s.isReserved).length;
      plan.push({ ...op, cfg, before, after: before.slice(0, -op.count), doomed, seats });
      console.log(
        `REMOVE ${op.count} ${cfg.label} (${op.type}) table(s): ${doomed.map((t) => t.tableNumber).join(", ")}` +
          ` - ${seats.length} seats, all empty${reserved ? ` (${reserved} were reserved for execs)` : ""}`
      );
    }
  }

  console.log("\nFloor plan (website splits each section in half across the gold carpet):");
  for (const p of plan) {
    const a = sides(p.before);
    const b = sides(p.after);
    const crossed = [...a.right.filter((n) => b.left.includes(n)), ...a.left.filter((n) => b.right.includes(n))];
    console.log(
      `  ${p.cfg.label}: ${p.before.length} -> ${p.after.length} tables | left ${range(a.left)} -> ${range(b.left)}, right ${range(a.right)} -> ${range(b.right)}` +
        (crossed.length ? ` | on screen, table(s) ${crossed.join(", ")} change side` : "")
    );
  }

  if (!apply) {
    console.log("\nDry run only - nothing changed. Re-run with --apply.");
    return mongoose.disconnect();
  }

  const doIt = async (session) => {
    for (const p of plan) {
      if (p.kind === "add") {
        for (const n of p.newNums) {
          const tableNumber = `${p.type}-${n}`;
          const [table] = await Table.create(
            [{ tableNumber, type: p.type, shape: p.cfg.shape, capacity: p.cfg.capacity, pricePerSeat: p.cfg.pricePerSeat }],
            { session }
          );
          const seats = await Seat.insertMany(
            Array.from({ length: p.cfg.capacity }, (_, j) => ({ seatNumber: `${tableNumber}-S${j + 1}`, table: table._id })),
            { session }
          );
          await Table.updateOne({ _id: table._id }, { seats: seats.map((s) => s._id) }, { session });
        }
      } else {
        await Seat.deleteMany({ _id: { $in: p.seats.map((s) => s._id) }, isBooked: { $ne: true } }, { session });
        await Table.deleteMany({ _id: { $in: p.doomed.map((t) => t._id) } }, { session });
      }
    }
  };

  // Atlas runs this atomically; LOCAL_NO_TXN=1 is only for a standalone local MongoDB
  if (process.env.LOCAL_NO_TXN === "1") {
    if (!uri.startsWith("mongodb://127.0.0.1")) throw new Error("LOCAL_NO_TXN is for local testing only");
    await doIt(null);
  } else {
    const session = await mongoose.startSession();
    await session.withTransaction(() => doIt(session));
    session.endSession();
  }

  const summary = plan
    .map((p) => `${p.kind === "add" ? "added" : "removed"} ${p.count} ${p.cfg.label}`)
    .join(", ");
  await logActivity("tables_changed", `Tables ${summary}`);
  console.log(`\nApplied: ${summary}.`);
  for (const type of Object.keys(TIER)) {
    const t = await Table.find({ type });
    console.log(`  ${TIER[type].label}: ${t.length} tables, ${t.reduce((n, x) => n + x.capacity, 0)} seats`);
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
