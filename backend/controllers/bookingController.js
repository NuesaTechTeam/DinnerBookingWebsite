import mongoose from "mongoose";
import crypto from "crypto";
import validator from "validator";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import {
  markDiscountUsed,
  ENGINEERING_DISCOUNT_AMOUNT,
} from "./discountController.js";
import { Student } from "../models/studentModel.js";
import { sendConfirmationEmail } from "../utils/emailService.js";
import { Table } from "../models/tableModel.js";
import { logActivity } from "../utils/activity.js";

// A short, human-typeable 6-digit entry code shown on the ticket email.
// Falls back to 8 digits in the (very unlikely) event of a collision.
const generateEntryCode = async (session) => {
  for (let i = 0; i < 30; i++) {
    const candidate = String(crypto.randomInt(100000, 1000000));
    const exists = await Booking.findOne({ code: candidate }).session(session);
    if (!exists) return candidate;
  }
  return String(crypto.randomInt(10000000, 100000000));
};

//Create a new booking with seat locking
export const createBooking = async (req, res) => {
  // Maintenance mode: pause all bookings
  if (process.env.MAINTENANCE_MODE === "true") {
    return res.status(503).json({
      success: false,
      message: "Bookings are currently paused. Please try again later.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, name, matricNo, phone, seatIds, baseAmount,totalAmount, isEngineering, invoiceNumber, tableType,  } = req.body;

    //Reject bad details BEFORE locking seats or creating anything -
    //an invalid email would otherwise only be caught by Paystack mid-payment
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!validator.isEmail(cleanEmail)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Release this guest's own earlier unpaid holds so an abandoned attempt
    // (closed Paystack popup, refresh, etc.) never blocks their retry
    const staleHolds = await Booking.find({
      email: cleanEmail,
      status: "pending",
      paymentVerified: { $ne: true },
    }).session(session);

    if (staleHolds.length > 0) {
      const staleSeatIds = staleHolds.flatMap((b) => b.seats);
      await Seat.updateMany(
        { _id: { $in: staleSeatIds }, isBooked: false },
        { lockedUntil: null, bookedBy: null },
        { session }
      );
      await Booking.deleteMany(
        { _id: { $in: staleHolds.map((b) => b._id) } },
        { session }
      );
    }

    //Check if seats are available and lock them
    const seats = await Seat.find({ _id: { $in: seatIds } }).session(session);

    //Check if any seat is already booked or locked
    const now = new Date();
    const unavailableSeats = seats.filter(
      (seat) => seat.isBooked || (seat.lockedUntil && seat.lockedUntil > now)
    );
    if (unavailableSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Some seats are no longer available",
        unavailableSeats: unavailableSeats.map((s) => s.seatNumber),
      });
    }

    //Lock seats for 15 minutes to allow payment
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { lockedUntil: lockExpiry },
      { session }
    );

    // Calculate total amount
    const seatPrices = await Seat.find({ _id: { $in: seatIds } })
      .populate("table")
      .session(session);

    // const amount = seatPrices.reduce(
    //   (total, seat) => total + seat.table.pricePerSeat,
    //   0
    // );

    let finalAmount = baseAmount
    let discountApplied = false
    let discountAmount = 0
    let engineeringStudentRef = null

    // Apply discount for REGULAR (Bronze) and VIP (Gold) tables and if invoiceNumber is provided
    if (invoiceNumber && (tableType === "REGULAR" || tableType === "VIP")) {
      // Verify the invoice number is valid and not used
      const student = await Student.findOne({
        invoiceNumber: invoiceNumber.toUpperCase().trim(),
        discountUsed: false
      }).session(session)

      if(student) {
        discountApplied = true
        // ₦2,000 off EACH seat (not a flat amount for the whole booking)
        discountAmount = ENGINEERING_DISCOUNT_AMOUNT * (seatIds?.length || 0)
        finalAmount = Math.max(0, baseAmount - discountAmount)
        engineeringStudentRef = student._id
      }
    }

    // Create booking
    const bookingCode = await generateEntryCode(session);
    const booking = new Booking({
      code: bookingCode,
      email: cleanEmail,
      name,
      matricNo,
      phone,
      amount: baseAmount,
      totalAmount: totalAmount,
      discountApplied,
      discountAmount,
      couponCode: invoiceNumber,
      engineeringStudentRef,
      isEngineering,
      seats: seatIds,
      trxref: `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      paystackRef: `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      status: "pending",
    });

    await booking.save({ session });

    // if(discountApplied && invoiceNumber) {
    //   await markDiscountUsed(invoiceNumber, booking._id)
    // }

    await session.commitTransaction();
    session.endSession();

    logActivity(
      "booking_created",
      `${name} placed an unpaid reservation for ${
        seatIds?.length || 0
      } seat(s) - awaiting Paystack payment`,
      {
        bookingId: booking._id.toString(),
        email: cleanEmail,
        amount: totalAmount,
      }
    );

    res.status(200).json({
      success: true,
      message: discountApplied
        ? `Booking created successfully! ₦${discountAmount.toLocaleString()} engineering discount applied.`
        : "Booking created successfully",
      booking,
      discountApplied,
      discountAmount: discountApplied ? discountAmount : 0,
      lockExpiry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Booking already exists or duplicate reference",
      });
    } else {
      console.error("Booking creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create booking",
      });
    }
  }
};

// export const createBooking = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       email,
//       name,
//       matricNo,
//       phone,
//       seatIds,
//       baseAmount,
//       totalAmount,
//       isEngineering,
//       invoiceNumber,
//       tableType,
//     } = req.body;

//     //Check if seats are available and lock them
//     const seats1 = await Seat.find({ _id: { $in: seatIds } }).session(session);

//     //Check if any seat is already booked or locked
//     const now = new Date();
//     const unavailableSeats = seats1.filter(
//       (seat) => seat.isBooked || (seat.lockedUntil && seat.lockedUntil > now)
//     );
//     if (unavailableSeats.length > 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Some seats are no longer available",
//         unavailableSeats: unavailableSeats.map((s) => s.seatNumber),
//       });
//     }

//     //Lock seats for 15 minutes to allow payment
//     const lockExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
//     await Seat.updateMany(
//       { _id: { $in: seatIds } },
//       { lockedUntil: lockExpiry },
//       { session }
//     );

//     // Calculate total amount
//     const seatPrices = await Seat.find({ _id: { $in: seatIds } })
//       .populate("table")
//       .session(session);

//     // const amount = seatPrices.reduce(
//     //   (total, seat) => total + seat.table.pricePerSeat,
//     //   0
//     // );

//     let finalAmount = baseAmount;
//     let discountApplied = false;
//     let discountAmount = 0;
//     let engineeringStudentRef = null;

//     // Apply discount only for REGULAR tables and if invoiceNumber is provided
//     if (invoiceNumber && tableType === "REGULAR") {
//       // Verify the invoice number is valid and not used
//       const student = await Student.findOne({
//         invoiceNumber: invoiceNumber.toUpperCase().trim(),
//         discountUsed: false,
//       }).session(session);

//       if (student) {
//         discountApplied = true;
//         discountAmount = ENGINEERING_DISCOUNT_AMOUNT;
//         finalAmount = Math.max(0, baseAmount - discountAmount);
//         engineeringStudentRef = student._id;
//       }
//     }

//     // Create booking
//     const booking = new Booking({
//       email,
//       name,
//       matricNo,
//       phone,
//       amount: baseAmount,
//       totalAmount: totalAmount,
//       discountApplied,
//       discountAmount,
//       couponCode: invoiceNumber,
//       engineeringStudentRef,
//       isEngineering,
//       seats: seatIds,
//       trxref: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       paystackRef: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       status: "confirmed",
//       paymentVerified: true,
//     });

//     await booking.save({ session });

//     //Update seats
//     await Seat.updateMany(
//       { _id: { $in: booking.seats } },
//       {
//         isBooked: true,
//         bookedBy: booking._id,
//         lockedUntil: null,
//       },
//       { session }
//     );

//     //Get seat numbers and their table Ids
//     const seats = await Seat.find(
//       { _id: { $in: booking.seats } },
//       "seatNumber table",
//       { session }
//     );

//     // Group seat numbers by table
//     const tableUpdates = {};
//     seats.forEach((seat) => {
//       if (!tableUpdates[seat.table]) {
//         tableUpdates[seat.table] = [];
//       }
//       tableUpdates[seat.table].push(seat.seatNumber);
//     });

//     // Update each tables bookedSeats array
//     for (const [tableId, seatNumbers] of Object.entries(tableUpdates)) {
//       await Table.findByIdAndUpdate(
//         tableId,
//         {
//           $addToSet: {
//             bookedSeats: { $each: seatNumbers },
//           },
//         },
//         { session }
//       );
//     }


//     await session.commitTransaction();
//     session.endSession();

//     await sendConfirmationEmail(booking);

//     // if(discountApplied && invoiceNumber) {
//     //   await markDiscountUsed(invoiceNumber, booking._id)
//     // }


//     res.status(200).json({
//       success: true,
//       message: discountApplied
//         ? `Booking created successfully! ₦${ENGINEERING_DISCOUNT_AMOUNT.toLocaleString()} engineering discount applied.`
//         : "Booking created successfully",
//       booking,
//       discountApplied,
//       discountAmount: discountApplied ? ENGINEERING_DISCOUNT_AMOUNT : 0,
//       lockExpiry,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     if (error.code === 11000) {
//       res.status(400).json({
//         success: false,
//         message: "Booking already exists or duplicate reference",
//       });
//     } else {
//       console.error("Booking creation error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to create booking",
//       });
//     }
//   }
// };

//Check seat availablity
export const checkSeatAvailability = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const now = new Date();

    const seats = await Seat.find({ _id: { $in: seatIds } });

    const unavailableSeats = seats.filter(
      (seat) => seat.isBooked || (seat.lockedUntil && seat.lockedUntil > now)
    );

    res.status(200).json({
      success: true,
      available: unavailableSeats.length === 0,
      unavailableSeats: unavailableSeats.map((s) => s.seatNumber),
    });
  } catch (error) {
    console.error("Seat availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check seat availability",
    });
  }
};

//Clean up expired locks(runs periodically)
export const cleanupExpiredLocks = async () => {
  try {
    const now = new Date();
    const result = await Seat.updateMany(
      {
        lockedUntil: { $lte: now },
        isBooked: false,
      },
      {
        lockedUntil: null,
        $unset: { bookedBy: "" }, //Remove bookedBy reference
      }
    );

    console.log(
      `${new Date().toISOString()} - Cleaned up ${
        result.nModified
      } expired seat locks`
    );

    //Remove reservations that were never paid for
    const expiredBookings = await Booking.find({
      status: "pending",
      createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    for (const booking of expiredBookings) {
      //Update seats associated with this expired booking
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        {
          lockedUntil: null,
          isBooked: false,
          $unset: { bookedBy: "" },
        }
      );

      //Delete it - no payment means no reservation
      await Booking.deleteOne({ _id: booking._id });
    }

    if (expiredBookings.length > 0) {
      logActivity(
        "booking_removed",
        `${expiredBookings.length} unpaid reservation(s) expired and were removed`
      );
    }

    console.log(
      `${new Date().toISOString()} - Removed ${
        expiredBookings.length
      } unpaid bookings`
    );
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

// Get a single booking
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("seats");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("seats")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// Get bookings by user email
export const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const bookings = await Booking.find({ email: email.toLowerCase() })
      .populate({
        path: "seats",
        populate: {
          path: "table",
          model: "Table",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings by email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// Remove an unpaid reservation (only reachable before payment succeeds)
export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // A paid reservation can never be removed through this route
    if (booking.paymentVerified || booking.status === "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Paid reservations cannot be removed",
      });
    }

    // Release the seats it was holding
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        isBooked: false,
        bookedBy: null,
        lockedUntil: null,
      },
      { session }
    );

    // Delete it entirely - without payment the reservation never existed
    await Booking.deleteOne({ _id: booking._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    logActivity(
      "booking_removed",
      `Unpaid reservation for ${booking.name} was removed`,
      { bookingId: id, email: booking.email }
    );

    res.json({
      success: true,
      message: "Reservation removed",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove reservation",
    });
  }
};

export const getBookingInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate({
        path: "seats",
        populate: {
          path: "table", // This ensures the table field is fully populated
          model: "Table", // Make sure to specify the model name
        },
      })
      .select(
        "name email matricNo phone amount status discountApplied discountAmount attendanceVerified attendanceVerifiedAt createdAt seats"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Extract table numbers from seats
    const tables = [
      ...new Set(booking.seats.map((seat) => seat.table?.tableNumber)),
    ].filter(Boolean);
    const seatNumbers = booking.seats.map((seat) => seat.seatNumber);

        const seatDetails = booking.seats.map((seat) => ({
          _id: seat._id,
          seatNumber: seat.seatNumber,
          tableNumber: seat.table?.tableNumber,
          isGivenTicket: seat.isGivenTicket,
        }));


         const allSeatsAttended = booking.seats.every(
           (seat) => seat.isGivenTicket
         );

    res.json({
      success: true,
      booking: {
        _id: booking._id,
        name: booking.name,
        email: booking.email,
        matricNo: booking.matricNo,
        phone: booking.phone,
        amount: booking.amount,
        status: booking.status,
        discountApplied: booking.discountApplied,
        discountAmount: booking.discountAmount,
        attendanceVerified: allSeatsAttended,
        attendanceVerifiedAt: booking.attendanceVerifiedAt,
        createdAt: booking.createdAt,
        tables: tables,
        seatNumbers: seatNumbers,
        seats: seatDetails,
        allSeatsAttended: allSeatsAttended,
      },
    });
  } catch (error) {
    console.error("Get public booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking information",
    });
  }
};

// to mark attendance (admin only)
export const verifyQRCode = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("seats")
      .populate("engineeringStudentRef");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a ${booking.status} reservation`,
      });
    }

    // Check if already verified/used
    if (booking.attendanceVerified) {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been used for entry",
      });
    }

    // Mark attendance and update seats
    booking.attendanceVerified = true;
    booking.attendanceVerifiedAt = new Date();
    await booking.save();

    // Mark seats as "attended"
    await Seat.updateMany(
      { _id: { $in: booking.seats.map((s) => s._id) } },
      {
        isGivenTicket: true,
      }
    );

    await logActivity(
      "check_in_all",
      `${req.admin?.sub || "admin"} checked in "${booking.name}" (${booking.seats.length} seat${
        booking.seats.length === 1 ? "" : "s"
      }) [${booking._id}]`
    );

    res.json({
      success: true,
      message: "Checked in successfully",
    });
  } catch (error) {
    console.error("QR verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify QR code",
    });
  }
};


export const markSeatAttendance = async (req, res) => {
  try {
    const { bookingId, seatId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate({
      path: "seats",
      populate: {
        path: "table",
        model: "Table",
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a ${booking.status} reservation`,
      });
    }

    // Check if the seat belongs to this booking
    const seat = booking.seats.find((s) => s._id.toString() === seatId);
    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found in this booking",
      });
    }

    // Check if seat is already marked
    if (seat.isGivenTicket) {
      return res.status(400).json({
        success: false,
        message: "This seat has already been marked as attended",
      });
    }

    // Mark the specific seat as attended
    await Seat.findByIdAndUpdate(seatId, {
      isGivenTicket: true,
    });

    // Refresh booking data to check if all seats are now attended
    const updatedBooking = await Booking.findById(bookingId).populate("seats");
    const allSeatsAttended = updatedBooking.seats.every(
      (seat) => seat.isGivenTicket
    );

    // If all seats are attended, mark the entire booking as verified
    if (allSeatsAttended && !updatedBooking.attendanceVerified) {
      updatedBooking.attendanceVerified = true;
      updatedBooking.attendanceVerifiedAt = new Date();
      await updatedBooking.save();
    }

    await logActivity(
      "seat_check_in",
      `${req.admin?.sub || "admin"} checked in ${seat.seatNumber} for "${booking.name}" [${booking._id}]${
        allSeatsAttended ? " (all seats attended)" : ""
      }`
    );

    res.json({
      success: true,
      message: "Seat marked as attended successfully",
      allSeatsAttended: allSeatsAttended,
    });
  } catch (error) {
    console.error("Seat attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark seat attendance",
    });
  }
};
