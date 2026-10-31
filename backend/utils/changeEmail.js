import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import validator from "validator";
import { Booking } from "../models/bookingModel.js";
import "../models/seatModel.js";
import "../models/tableModel.js";
import { sendConfirmationEmail } from "./emailService.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Fixes the email address on a booking (e.g. the guest mistyped it) and, with
// --send, emails the ticket to the corrected address. The search must match
// exactly one booking (name fragment, current email, or entry code).
// DRY RUN unless --apply.
//
//   node utils/changeEmail.js "temitope toluwani" --to new@mail.com [--apply] [--send]

const term = process.argv[2];
const toIdx = process.argv.indexOf("--to");
const newEmail = toIdx > -1 ? String(process.argv[toIdx + 1]).trim().toLowerCase() : "";
const apply = process.argv.includes("--apply");
const send = process.argv.includes("--send");

const run = async () => {
  if (!term || term.startsWith("--") || !validator.isEmail(newEmail)) {
    console.error('Usage: node utils/changeEmail.js "<name | email | entry code>" --to <new email> [--apply] [--send]');
    process.exit(1);
  }
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}`);

  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const found = await Booking.find({ status: { $ne: "cancelled" }, $or: [{ name: re }, { email: re }, { code: term }] })
    .populate({ path: "seats", populate: { path: "table" } });
  if (found.length === 0) throw new Error(`No booking matches "${term}"`);
  if (found.length > 1) {
    found.forEach((b) => console.log(`  ${b.name} <${b.email}> #${b.code} - ${b.seats.map((s) => s.seatNumber).join(", ")}`));
    throw new Error(`${found.length} bookings match "${term}" - search by the entry code instead`);
  }
  const b = found[0];

  console.log(`\n${b.name} #${b.code} [${b.status}] seats: ${b.seats.map((s) => s.seatNumber).join(", ")}`);
  console.log(`  current email: ${b.email}`);
  console.log(`  new email:     ${newEmail}`);
  const clash = await Booking.find({ email: newEmail, _id: { $ne: b._id }, status: { $ne: "cancelled" } }, "name code");
  if (clash.length) console.log(`  NOTE: that address is also on: ${clash.map((c) => `${c.name} #${c.code}`).join(", ")}`);
  if (b.email === newEmail) console.log("  (email is already this address)");

  if (!apply) {
    console.log(`\nDry run only - nothing changed. Re-run with --apply${send ? "" : " (and --send to email the ticket)"}.`);
    return mongoose.disconnect();
  }

  const oldEmail = b.email;
  await Booking.updateOne(
    { _id: b._id },
    { $set: { email: newEmail, emailStatus: "not_sent", emailError: "" } }
  );
  await logActivity("email_changed", `${b.name}: email changed ${oldEmail} -> ${newEmail} [${b._id}]`, {
    bookingId: String(b._id),
  });
  console.log(`\nEmail changed to ${newEmail}.`);

  if (send) {
    if (b.status !== "confirmed") throw new Error("Booking is not confirmed - ticket not sent");
    const fresh = await Booking.findById(b._id);
    const ok = await sendConfirmationEmail(fresh);
    console.log(ok ? `Ticket emailed to ${newEmail}` : "EMAIL FAILED - the retry job will try again, or use utils/resendTicket.js");
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
