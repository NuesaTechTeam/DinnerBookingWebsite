import nodemailer from "nodemailer"
import generateEmailTemplate from "./emailTemplate.js"

//Create Transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })
} 

// Send confirmation email
export const sendConfirmationEmail = async(booking) => {
    try {
      // Populate seats with table information
      await booking.populate({
        path: "seats",
        populate: {
          path: "table",
          model: "Table",
        },
      });

      const transporter = createTransporter()

      const mailOptions = {
        from: process.env.EMAIL_FROM || "nuesadinner@gmail.com",
        to: booking.email,
        subject: "Welcome to La Famiglia - Casablanca",
        html: generateEmailTemplate(booking, booking.seats),
        text: `
        Dinner Booking Confirmation
        Welcome to La Famiglia - Casablanca
        ----------------------------
        Name: ${booking.name}
        Matric No: ${booking.matricNo}
        Email: ${booking.email}
        Phone: ${booking.phone}
        Amount: ₦${booking.amount.toLocaleString()}
        Seats: ${booking.seats.map((seat) => seat.seatNumber).join(", ")}
        Tables: ${[
          ...new Set(booking.seats.map((seat) => seat.table.tableNumber)),
        ].join(", ")}
        
        Thank you for your booking!
        
        If you have any questions, please contact us at nuesatechteam2025@gmail.com
      `,
      };

      const info = await transporter.sendMail(mailOptions)
      console.log('Confirmation email sent: ', info.messageId);
      return true
    } catch (error) {
        console.error('Error sending confirmation email: ', error);
        return false
    }
}

// Send feedback notification
export const sendFeedbackNotification = async (booking) => {
  try {
    await booking.populate({
      path: 'seats',
      populate: {
        path: 'table',
        model: 'Table'
      }
    });
    
    const tableNumbers = [...new Set(booking.seats.map(seat => seat.table.tableNumber))];
    const seatNumbers = booking.seats.map(seat => seat.seatNumber).join(', ');
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'nuesadinner@gmail.com',
      to: process.env.ADMIN_EMAIL || 'nuesatechteam2025@gmail.com',
      subject: `New Dinner Booking: ${booking.name}`,
      html: `
        <h2>New Dinner Booking</h2>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Matric No:</strong> ${booking.matricNo}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Table(s):</strong> ${tableNumbers.join(', ')}</p>
        <p><strong>Seat(s):</strong> ${seatNumbers}</p>
        <p><strong>Amount:</strong> ₦${booking.amount.toLocaleString()}</p>
        <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Feedback notification sent');
    
    return true;
  } catch (error) {
    console.error('Error sending feedback notification:', error);
    return false;
  }
};