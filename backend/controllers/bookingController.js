import mongoose from "mongoose";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";


//Create a new booking with seat locking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, name, matricNo, phone, seatIds, totalAmount, amount, isEngineering } = req.body;

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

    // Create booking
    const booking = new Booking({
      email,
      name,
      matricNo,
      phone,
      amount,
      totalAmount,
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

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Seats locked successfully. Proceed to payment.",
      booking,
      lockExpiry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

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
        path: 'seats',
        populate: {
          path: 'table',
          model: 'Table'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
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
        message: 'Booking not found'
      });
    }
    
    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });
    
    // Release seats
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { 
        isBooked: false,
        bookedBy: null,
        lockedUntil: null
      },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};


