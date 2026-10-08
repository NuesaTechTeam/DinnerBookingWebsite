import express from "express"
import { createBooking, getBooking, getBookings, getBookingsByEmail, cancelBooking, checkSeatAvailability, getBookingInfo, verifyQRCode, markSeatAttendance } from "../controllers/bookingController.js"
import { requireAdmin } from "../middlewares/adminAuth.js"

const router = express.Router()

router.post("/", createBooking)
router.post("/check-availability", checkSeatAvailability)
// Full booking records are admin-only (the public only needs booking-info)
router.get("/", requireAdmin, getBookings)
router.get("/:id", requireAdmin, getBooking)
router.get("/:id/booking-info", getBookingInfo);
router.post("/verify/:bookingId", verifyQRCode);
router.post("/:bookingId/mark-seat/:seatId", markSeatAttendance);
router.get("/email/:email", getBookingsByEmail);
router.delete("/:id", cancelBooking);

export default router