import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import "../models/tableModel.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ADMIN OVERRIDE: cancels UNPAID (pending) reservations and frees their seats
// WITHOUT asking Paystack first. Use it only when you are sure nobody is paying
// (e.g. your own test bookings that Paystack still shows as "in progress").
// Confirmed/paid bookings are refused. If money does arrive later the webhook
// logs a "payment_orphaned" entry and utils/recoverBooking.js can restore it.
// DRY RUN unless --apply.
//   node utils/releaseHold.js <bookingId> [<bookingId> ...] [--apply]

const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const apply = process.argv.includes("--apply");

const run = async () => {
  if (!ids.length || ids.some((i) => !mongoose.isValidObjectId(i))) {
    console.error("Usage: node utils/releaseHold.js <bookingId> [<bookingId> ...] [--apply]");
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}\n`);

  const bookings = await Booking.find({ _id: { $in: ids } }).populate("seats", "seatNumber isBooked");
  const missing = ids.filter((i) => !bookings.some((b) => String(b._id) === i));
  if (missing.length) console.log(`Already gone (nothing to do): ${missing.join(", ")}`);

  for (const b of bookings) {
    if (b.status !== "pending" || b.paymentVerified) {
      console.log(`REFUSED ${b._id}: ${b.name} is ${b.status}${b.paymentVerified ? " and paid" : ""} - only unpaid reservations can be released`);
      continue;
    }
    const mins = Math.round((Date.now() - b.createdAt) / 60000);
    console.log(
      `${apply ? "Releasing" : "Would release"} ${b.seats.map((s) => s.seatNumber).join(", ")} held by ${b.name} <${b.email}> ` +
        `(started ${mins} min ago, total ${b.totalAmount}${b.promoCode ? `, promo ${b.promoCode}` : ""}, ref ${b.paystackRef})`
    );
    if (!apply) continue;
    await Seat.updateMany(
      { _id: { $in: b.seats.map((s) => s._id) }, isBooked: { $ne: true } },
      { lockedUntil: null, $unset: { bookedBy: "" } }
    );
    await Booking.deleteOne({ _id: b._id, status: "pending", paymentVerified: { $ne: true } });
    await logActivity(
      "hold_released_by_admin",
      `Unpaid reservation for ${b.name} (${b.seats.map((s) => s.seatNumber).join(", ")}) released manually [ref ${b.paystackRef}]`,
      { bookingId: String(b._id), reference: b.paystackRef }
    );
  }
  if (!apply) console.log("\nDry run only - nothing changed. Re-run with --apply.");
  else console.log("\nDone - the seats are free again.");
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
