import nodemailer from "nodemailer";
import generateEmailTemplate from "./emailTemplate.js";
import generateEmailTemplatePresident from "./presidentTemplate.js";

// Create Transporter (Gmail)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendHtmlEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.GMAIL_EMAIL,
    to,
    subject,
    html,
  });
  console.log("Email sent:", info.messageId, "->", to);
  return info;
};

export const testing = async (booking) => {
  try {
    await sendHtmlEmail({
      to: booking.email,
      subject: "FÀÁJÍ LAWA | Your Reservation is Confirmed",
      html: generateEmailTemplate(booking, booking.seats),
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendPresidentEmail = async (booking) => {
  try {
    await sendHtmlEmail({
      to: booking.email,
      subject: "FÀÁJÍ LAWA | Your Reservation is Confirmed",
      html: generateEmailTemplatePresident(booking),
    });
    return true;
  } catch (error) {
    console.error("Error sending president email:", error);
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
      subject: "FÀÁJÍ LAWA | Your Reservation is Confirmed",
      html: generateEmailTemplate(booking, booking.seats),
    });

    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
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
    console.error("Error sending feedback notification:", error);
    return false;
  }
};
