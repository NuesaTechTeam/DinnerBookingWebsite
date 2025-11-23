import mongoose from "mongoose";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import {
  markDiscountUsed,
  ENGINEERING_DISCOUNT_AMOUNT,
} from "./discountController.js";
import { Student } from "../models/studentModel.js";
import { sendConfirmationEmail } from "../utils/emailService.js";
import { Table } from "../models/tableModel.js";

//Create a new booking with seat locking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, name, matricNo, phone, seatIds, baseAmount,totalAmount, isEngineering, invoiceNumber, tableType,  } = req.body;

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

    // Apply discount only for REGULAR tables and if invoiceNumber is provided
    if (invoiceNumber && tableType === "REGULAR") {
      // Verify the invoice number is valid and not used
      const student = await Student.findOne({
        invoiceNumber: invoiceNumber.toUpperCase().trim(),
        discountUsed: false
      }).session(session)

      if(student) {
        discountApplied = true
        discountAmount = ENGINEERING_DISCOUNT_AMOUNT
        finalAmount = Math.max(0, baseAmount - discountAmount)
        engineeringStudentRef = student._id
      }
    }

    // Create booking
    const booking = new Booking({
      email,
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

    res.status(200).json({
      success: true,
      message: discountApplied
        ? `Booking created successfully! ₦${ENGINEERING_DISCOUNT_AMOUNT.toLocaleString()} engineering discount applied.`
        : "Booking created successfully",
      booking,
      discountApplied,
      discountAmount: discountApplied ? ENGINEERING_DISCOUNT_AMOUNT : 0,
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

    //cancel bookings that were pending but never paid
    const expiredBookings = await Booking.find({
      status: "pending",
      createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    for (const booking of expiredBookings) {
      booking.status = "cancelled";
      await booking.save();

      //Update seats associated with this expired booking
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        {
          lockedUntil: null,
          isBooked: false,
          $unset: { bookedBy: "" },
        }
      );
    }

    console.log(
      `${new Date().toISOString()} - Cancelled ${
        expiredBookings.length
      } expired bookings`
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

// Cancel a booking
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

    if (booking.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save({ session });

    // Release seats
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        isBooked: false,
        bookedBy: null,
        lockedUntil: null,
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
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
        "name email matricNo phone amount status discountApplied discountAmount createdAt seats"
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

// to mark attendance
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

    // Check if already verified/used
    if (booking.attendanceVerified) {
      return res.status(400).json({
        success: false,
        message: "This QR code has already been used for entry",
      });
    }

    // Mark attendance and update seats
    booking.attendanceVerified = true;
    booking.attendanceVerifiedAt = new Date();
    await booking.save();

    // Mark seats as "attended"
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        isGivenTicket: true,
      }
    );

    res.json({
      success: true,
      message: "QR code verified successfully",
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
