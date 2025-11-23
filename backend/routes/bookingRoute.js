import express from "express"
import { createBooking, getBooking, getBookings, getBookingsByEmail, cancelBooking, checkSeatAvailability, getBookingInfo, verifyQRCode, markSeatAttendance } from "../controllers/bookingController.js"

const router = express.Router()

router.post("/", createBooking)
router.post("/check-availability", checkSeatAvailability)
router.get("/", getBookings)
router.get("/:id", getBooking)
router.get("/:id/booking-info", getBookingInfo);
router.post("/verify/:bookingId", verifyQRCode);
router.post("/:bookingId/mark-seat/:seatId", markSeatAttendance);
router.get("/email/:email", getBookingsByEmail);
router.delete("/:id", cancelBooking);

export default router