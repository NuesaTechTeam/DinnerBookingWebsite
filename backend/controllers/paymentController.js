import axios from "axios";
import {Booking} from "../models/bookingModel.js"
import { Seat } from "../models/seatModel.js";
import { sendConfirmationEmail, sendFeedbackNotification } from "../utils/emailService.js";

//vVerify Paystack payment
export const verifyPayment = async (req, res) => {
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
            //Update booking status
            const booking = await Booking.findById(bookingId)
            if(booking){
                booking.paymentVerified = true
                booking.status = "confirmed"
                booking.paystackRef = reference
                await booking.save()

                //Update seats
                await Seat.updateMany(
                    {_id: {$in: booking.seats}},
                    {
                        isBooked: true,
                        bookedBy: booking._id,
                        lockedUntil: null
                    }
                )

                await sendConfirmationEmail(booking)

                //for now
                // await sendFeedbackNotification(booking)

                res.status(200).json({
                    success: true,
                    message: "Payment verified successfully",
                    booking
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                })
            }
        } else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            })
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        })
        
    }
}