import axios from "axios";
import {Booking} from "../models/bookingModel.js"
import { Seat } from "../models/seatModel.js";
import { sendConfirmationEmail, sendFeedbackNotification } from "../utils/emailService.js";
import mongoose from "mongoose";
import { Table } from "../models/tableModel.js";

//vVerify Paystack payment
export const verifyPayment = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const {reference, bookingId} = req.body

        //Verify payment with paystack
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            }
          }
        );

        if (response.data.data.status === "success") {
          const amountPaid = response.data.data.amount / 100;

          //Update booking status
          const booking = await Booking.findById(bookingId).session(session);
          if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
              success: false,
              message: "Booking not found",
            });
          }

          // Verify that amount paid matches expected amount
          if (amountPaid !== booking.totalAmount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Amount paid (₦${amountPaid}) does not match expected amount (₦${booking.totalAmount})`,
            });
          }
          booking.paymentVerified = true;
          booking.status = "confirmed";
          booking.paystackRef = reference;
          booking.trxref = response.data.data.reference;
          await booking.save({ session });

          //Update seats
          await Seat.updateMany(
            { _id: { $in: booking.seats } },
            {
              isBooked: true,
              bookedBy: booking._id,
              lockedUntil: null,
            },
            { session }
          );

          //Get seat numbers and their table Ids
          const seats = await Seat.find(
            { _id: { $in: booking.seats } },
            "seatNumber table",
            { session }
          );

          // Group seat numbers by table
          const tableUpdates = {};
          seats.forEach((seat) => {
            if (!tableUpdates[seat.table]) {
              tableUpdates[seat.table] = [];
            }
            tableUpdates[seat.table].push(seat.seatNumber);
          });

          // Update each tables bookedSeats array
          for (const [tableId, seatNumbers] of Object.entries(tableUpdates)) {
            await Table.findByIdAndUpdate(
              tableId,
              {
                $addToSet: {
                  bookedSeats: { $each: seatNumbers },
                },
              },
              { session }
            );
          }

          await session.commitTransaction();
          session.endSession();

          await sendConfirmationEmail(booking);

          //for now
          // await sendFeedbackNotification(booking)

          res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            booking,
          });
        } else {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            })
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        })
        
    }
}