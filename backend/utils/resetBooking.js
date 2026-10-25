import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";
import { Student } from "../models/studentModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Frees a booking's seats, clears the table's bookedSeats, restores any
// coupon/discount used, and deletes the booking. Intended for test bookings.
const bookingId = process.argv[2];
const restoreDiscount = process.argv.includes("--restore-discount");

const run = async () => {
  if (!bookingId) {
    console.error("Usage: node utils/resetBooking.js <bookingId> [--restore-discount]");
    process.exit(1);
  }

  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"}`);

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.error("Booking not found");
    process.exit(1);
  }

  console.log(
    `Booking: ${booking.name} | status=${booking.status} | coupon=${booking.couponCode || "-"} | seats=${booking.seats.length}`
  );

  const seats = await Seat.find({ _id: { $in: booking.seats } });
  for (const seat of seats) {
    await Seat.updateOne(
      { _id: seat._id },
      { isBooked: false, bookedBy: null, lockedUntil: null, isGivenTicket: false }
    );
    await Table.updateOne(
      { _id: seat.table },
      { $pull: { bookedSeats: seat.seatNumber } }
    );
    console.log(`Freed ${seat.seatNumber}`);
  }

  const codes = booking.couponCodes?.length
    ? booking.couponCodes
    : booking.couponCode
    ? [booking.couponCode]
    : [];
  for (const code of restoreDiscount ? codes : []) {
    const student = await Student.findOneAndUpdate(
      { invoiceNumber: code.toUpperCase().trim() },
      { discountUsed: false, $unset: { discountUsedOn: "", discountUsedForBooking: "" } },
      { new: true }
    );
    console.log(`Discount ${code}: ${student ? "restored" : "student not found"}`);
  }

  await Booking.deleteOne({ _id: booking._id });
  console.log("Booking deleted.");

  const remaining = await Booking.countDocuments();
  console.log(`Bookings remaining: ${remaining}`);

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
