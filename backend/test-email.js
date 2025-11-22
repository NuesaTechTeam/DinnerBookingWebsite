import dotenv from "dotenv"
import { sendConfirmationEmail, testing } from "./utils/emailService.js";

dotenv.config(); 


const testBooking = {
  _id: "test123",
  name: "Emma Then",
  matricNo: "21/ENG02/029",
  email: "okoyemcpaul86@gmail.com", // Send to yourself for testing
  phone: "+2348123456789",
  amount: 32000,
  createdAt: new Date(),
  seats: [
    {
      seatNumber: "VVIP-1-S1",
      table: { tableNumber: "VVIP-5" },
    },
  ],
};

const booking = {
  "_id":  "692065270112d8e603c14143",
  "email": "alexanwabueze16@gmail.com",
  "name": "Mmesoma Victoria Nwabueze",
  "matricNo": "22/ENG02/048",
  "phone": "09160875666",
  "amount": 8000,
  "totalAmount": 8500,
  "discountApplied": false,
  "discountAmount": 0,
  "engineeringStudentRef": null,
  "isEngineering": false,
  "trxref": "T679848048232243",
  "paystackRef": "T679848048232243",
  "status": "confirmed",
  "attendanceVerified": false,
  "seats": [
   "68b899ae3be126a0a2d7350d"
  ],
  "paymentVerified": true,
  "createdAt":  "2025-11-21T13:12:07.427Z",
  "updatedAt":  "2025-11-21T13:12:20.576Z",
  "__v": 0
}

// Mock populate function
booking.populate = async () => {};

sendConfirmationEmail(booking)
  .then((success) => {
    console.log("Test email sent:", success);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test email failed:", error);
    process.exit(1);
  });
