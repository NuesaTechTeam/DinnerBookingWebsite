import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import "../models/seatModel.js";
import "../models/tableModel.js";
import { sendConfirmationEmail } from "./emailService.js";
import { logActivity } from "./activity.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Shows a booking's ticket email status; with --send emails the ticket.
// Without --force it will not resend a ticket already sent or delivered.
//   node utils/resendTicket.js <entry code> [--send] [--force]
const code = process.argv[2];
const send = process.argv.includes("--send");
const force = process.argv.includes("--force");

const run = async () => {
  if (!code || code.startsWith("--")) {
    console.error("Usage: node utils/resendTicket.js <entry code> [--send] [--force]");
    process.exit(1);
  }
  await mongoose.connect(process.env.PROD_MONGO_URI || process.env.MONGO_URI);
  const booking = await Booking.findOne({ code }).populate({ path: "seats", populate: { path: "table" } });
  if (!booking) throw new Error(`No booking with entry code ${code}`);

  console.log(
    `${booking.name} <${booking.email}> #${booking.code} [${booking.status}] seats: ${booking.seats
      .map((s) => s.seatNumber)
      .join(", ")}`
  );
  console.log(
    `Ticket email: ${booking.emailStatus} | attempts ${booking.emailAttempts ?? 0} | last sent ${
      booking.emailSentAt ? booking.emailSentAt.toISOString() : "never"
    }${booking.emailError ? ` | last error: ${booking.emailError}` : ""}`
  );

  if (send) {
    if (booking.status !== "confirmed") throw new Error("Only confirmed bookings get tickets");
    if (["sent", "delivered"].includes(booking.emailStatus) && !force) {
      console.log("Already sent - not resending (add --force to send again).");
    } else {
      const ok = await sendConfirmationEmail(booking);
      console.log(ok ? `Ticket emailed to ${booking.email}` : "EMAIL FAILED - see error above");
      if (ok) await logActivity("ticket_resent", `Ticket re-sent to ${booking.email} [${booking._id}]`);
    }
  }
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
