import express from "express";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  login,
  getBookings,
  getStats,
  getActivity,
} from "../controllers/adminController.js";

const router = express.Router();

// Login (rate limited) - the only unauthenticated admin route
router.post("/login", authLimiter, login);

// Everything below is read-only and requires a valid admin token.
// NOTE: deliberately NO create/update/delete routes for reservations here.
router.use(requireAdmin);

router.get("/bookings", getBookings);
router.get("/stats", getStats);
router.get("/activity", getActivity);

export default router;
