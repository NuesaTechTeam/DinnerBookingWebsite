import dotenv from "dotenv"
import { sendConfirmationEmail } from "./utils/emailService.js";

dotenv.config();


const testBooking = {
  _id: "test123",
  name: "Asira Donzel",
  matricNo: "21/ENG02/029",
  email: "asiradonzel@gmail.com", // Send to yourself for testing
  phone: "+2348123456789",
  amount: 32000,
  createdAt: new Date(),
  seats: [
    {
      seatNumber: "VVIP-1-S1",
      table: { tableNumber: "VVIP-1" },
    },
  ],
};

// Mock populate function
testBooking.populate = async () => {};

sendConfirmationEmail(testBooking)
  .then((success) => {
    console.log("Test email sent:", success);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test email failed:", error);
    process.exit(1);
  });
