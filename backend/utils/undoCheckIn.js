import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import "../models/tableModel.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Reverses a mistaken check-in: clears the booking's attendance flag and
// marks its seats as not checked in, so the ticket works at the door again.
// DRY RUN unless --apply.
//   node utils/undoCheckIn.js <entry code> [--apply]
const code = process.argv[2];
const apply = process.argv.includes("--apply");

const run = async () => {
  if (!code || code.startsWith("--")) {
    console.error("Usage: node utils/undoCheckIn.js <entry code> [--apply]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}`);

  const booking = await Booking.findOne({ code }).populate("seats");
  if (!booking) throw new Error(`No booking with entry code ${code}`);

  const checkedSeats = booking.seats.filter((s) => s.isGivenTicket);
  console.log(`\n${booking.name} <${booking.email}> #${booking.code} [${booking.status}]`);
  console.log(
    `  Booking checked in: ${booking.attendanceVerified ? `yes (${booking.attendanceVerifiedAt?.toISOString() || "no time"})` : "no"}`
  );
  console.log(
    `  Seats: ${booking.seats.map((s) => `${s.seatNumber} ${s.isGivenTicket ? "CHECKED IN" : "not checked in"}`).join(", ")}`
  );

  if (!booking.attendanceVerified && checkedSeats.length === 0) {
    console.log("\nNothing to undo - this booking is not checked in.");
    return mongoose.disconnect();
  }
  console.log(
    `\nWill set the booking and ${checkedSeats.length} seat(s) (${checkedSeats.map((s) => s.seatNumber).join(", ") || "-"}) back to NOT checked in.`
  );

  if (!apply) {
    console.log("Dry run only - nothing changed. Re-run with --apply.");
    return mongoose.disconnect();
  }

  await Seat.updateMany({ _id: { $in: booking.seats.map((s) => s._id) } }, { isGivenTicket: false });
  await Booking.updateOne(
    { _id: booking._id },
    { attendanceVerified: false, $unset: { attendanceVerifiedAt: "" } }
  );
  await logActivity(
    "check_in_undone",
    `Check-in undone for "${booking.name}" (${booking.seats.map((s) => s.seatNumber).join(", ")}) [${booking._id}]`
  );
  console.log("Undone - the booking now shows not checked in and the ticket works at the door again.");
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
