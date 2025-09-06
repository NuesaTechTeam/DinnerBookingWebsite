import express from "express"
import { createBooking, getBooking, getBookings, getBookingsByEmail, cancelBooking, checkSeatAvailability } from "../controllers/bookingController.js"

const router = express.Router()

router.post("/", createBooking)
router.post("/check-availability", checkSeatAvailability)
router.get("/", getBookings)
router.get("/:id", getBooking)
router.get("/email/:email", getBookingsByEmail);
router.delete("/:id", cancelBooking);

export default router