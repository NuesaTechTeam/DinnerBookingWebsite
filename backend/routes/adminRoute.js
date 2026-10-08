import express from "express";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { requireAdmin, requireSuperAdmin } from "../middlewares/adminAuth.js";
import {
  login,
  getBookings,
  getStats,
  getActivity,
  listUsers,
  createUser,
  updateUser,
} from "../controllers/adminController.js";

const router = express.Router();

// Login (rate limited) - the only unauthenticated admin route
router.post("/login", authLimiter, login);

// Everything below requires a valid admin token.
// NOTE: deliberately NO create/update/delete routes for reservations here.
router.use(requireAdmin);

router.get("/bookings", getBookings);
router.get("/stats", getStats);
router.get("/activity", getActivity);

// Admin account management - super admin only
router.get("/users", requireSuperAdmin, listUsers);
router.post("/users", requireSuperAdmin, createUser);
router.patch("/users/:id", requireSuperAdmin, updateUser);

export default router;
