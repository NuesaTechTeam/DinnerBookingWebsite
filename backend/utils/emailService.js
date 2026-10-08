import axios from "axios";
import generateEmailTemplate from "./emailTemplate.js";
import generateEmailTemplatePresident from "./presidentTemplate.js";

// Render blocks outbound SMTP, so we send over HTTPS via Brevo's transactional API.
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// Give every confirmation its own subject so Gmail (and other clients) do not
// thread separate bookings together - threaded "collapsed" messages hide the QR.
const confirmationSubject = (booking) => {
  const ref = String(booking?._id || "").slice(-8).toUpperCase();
  const who = booking?.name ? ` - ${booking.name}` : "";
  return `FÀÁJÍ LAWA | Reservation Confirmed${who} (#${ref})`;
};

export const sendHtmlEmail = async ({ to, subject, html }) => {
  const senderEmail =
    process.env.EMAIL_FROM || process.env.GMAIL_EMAIL || "nuesa.abuad.tech@gmail.com";

  const response = await axios.post(
    BREVO_URL,
    {
      sender: { name: "FÀÁJÍ LAWA", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    }
  );

  console.log(
    "Email sent (Brevo):",
    response.data?.messageId || response.status,
    "->",
    to
  );
  return response.data;
};

export const testing = async (booking) => {
  try {
    await sendHtmlEmail({
      to: booking.email,
      subject: confirmationSubject(booking),
      html: generateEmailTemplate(booking, booking.seats),
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error?.response?.data || error.message);
    return false;
  }
};

export const sendPresidentEmail = async (booking) => {
  try {
    await sendHtmlEmail({
      to: booking.email,
      subject: confirmationSubject(booking),
      html: generateEmailTemplatePresident(booking),
    });
    return true;
  } catch (error) {
    console.error("Error sending president email:", error?.response?.data || error.message);
    return false;
  }
};

// Send confirmation email
export const sendConfirmationEmail = async (booking) => {
  try {
    // Populate seats with table information so the template can show tables
    await booking.populate({
      path: "seats",
      populate: {
        path: "table",
        model: "Table",
      },
    });

    await sendHtmlEmail({
      to: booking.email,
      subject: confirmationSubject(booking),
      html: generateEmailTemplate(booking, booking.seats),
    });

    return true;
  } catch (error) {
    console.error(
      "Error sending confirmation email:",
      error?.response?.data || error.message
    );
    return false;
  }
};

// Send feedback/admin notification
export const sendFeedbackNotification = async (booking) => {
  try {
    await booking.populate({
      path: "seats",
      populate: {
        path: "table",
        model: "Table",
      },
    });

    const tableNumbers = [
      ...new Set(booking.seats.map((seat) => seat.table.tableNumber)),
    ];
    const seatNumbers = booking.seats.map((seat) => seat.seatNumber).join(", ");

    await sendHtmlEmail({
      to: process.env.ADMIN_EMAIL || "nuesatechteam2025@gmail.com",
      subject: `New Dinner Booking: ${booking.name}`,
      html: `
        <h2>New Dinner Booking</h2>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Matric No:</strong> ${booking.matricNo}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Table(s):</strong> ${tableNumbers.join(", ")}</p>
        <p><strong>Seat(s):</strong> ${seatNumbers}</p>
        <p><strong>Amount:</strong> ₦${booking.amount.toLocaleString()}</p>
        <p><strong>Booking Date:</strong> ${new Date(
          booking.createdAt
        ).toLocaleString()}</p>
      `,
    });

    console.log("Feedback notification sent");
    return true;
  } catch (error) {
    console.error(
      "Error sending feedback notification:",
      error?.response?.data || error.message
    );
    return false;
  }
};
