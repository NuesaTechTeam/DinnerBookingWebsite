import { Booking } from "../models/bookingModel.js";
import { sendConfirmationEmail } from "./emailService.js";
import { getEmailOverview, clearEmailOverviewCache } from "./brevoStatus.js";
import { logActivity } from "./activity.js";

// Every paid booking must end up with a ticket in the guest's inbox. The
// ticket is first sent when payment is confirmed; this job catches any that
// failed or were never sent (Brevo outage, server restart mid-send...).
const MAX_ATTEMPTS = 5;
const MAX_PER_RUN = 25;
// Leave fresh confirmations alone so we never race the first send
const SETTLE_MS = 5 * 60 * 1000;

export const retryUnsentTickets = async () => {
  try {
    // Refresh statuses from Brevo first (also backfills older bookings)
    if (process.env.BREVO_API_KEY) {
      const overview = await getEmailOverview({ force: true });
      if (!overview.brevo.ok) {
        console.log(`Ticket retry skipped - Brevo unreachable: ${overview.brevo.error}`);
        return;
      }
    }

    const due = await Booking.find({
      status: "confirmed",
      paymentVerified: true,
      emailStatus: { $in: ["not_sent", "failed"] },
      // Older bookings have no attempt counter yet
      $or: [
        { emailAttempts: { $lt: MAX_ATTEMPTS } },
        { emailAttempts: { $exists: false } },
      ],
      updatedAt: { $lte: new Date(Date.now() - SETTLE_MS) },
    })
      .sort({ createdAt: 1 })
      .limit(MAX_PER_RUN);

    if (due.length === 0) return;

    let sent = 0;
    for (const booking of due) {
      if (await sendConfirmationEmail(booking)) sent++;
    }
    clearEmailOverviewCache();

    console.log(`Ticket retry: sent ${sent}/${due.length} outstanding ticket(s)`);
    logActivity(
      "tickets_auto_sent",
      `Automatically emailed ${sent} of ${due.length} outstanding ticket(s): ${due
        .map((b) => b.email)
        .join(", ")}`
    );
  } catch (error) {
    console.error("Ticket retry error:", error);
  }
};
