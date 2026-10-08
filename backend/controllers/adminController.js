import crypto from "crypto";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Student } from "../models/studentModel.js";
import { ActivityLog } from "../models/activityLogModel.js";
import { logActivity } from "../utils/activity.js";
import { signAdminToken } from "../middlewares/adminAuth.js";

const matches = (provided, expected) => {
  const a = Buffer.from(String(provided ?? ""));
  const b = Buffer.from(String(expected ?? ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// POST /admin/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    if (!envUser || !envPass) {
      return res.status(503).json({
        success: false,
        message: "Admin login is not configured on this server",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    if (!matches(username, envUser) || !matches(password, envPass)) {
      await logActivity(
        "admin_login_failed",
        `Failed login attempt for "${String(username).slice(0, 40)}"`
      );
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = signAdminToken(envUser);
    await logActivity("admin_login", `${envUser} logged in to the dashboard`);

    res.json({ success: true, token, admin: envUser, expiresIn: "12h" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// GET /admin/bookings  (read-only)
export const getBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && ["pending", "confirmed", "cancelled"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: "seats",
        populate: { path: "table", model: "Table" },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Admin get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// GET /admin/stats  (read-only)
export const getStats = async (req, res) => {
  try {
    const [
      totalBookings,
      confirmed,
      pending,
      cancelled,
      checkedIn,
      students,
      discountsUsed,
      seatsSold,
      revenueAgg,
      seatsByTier,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ status: "confirmed", attendanceVerified: true }),
      Student.countDocuments(),
      Booking.countDocuments({ status: "confirmed", discountApplied: true }),
      Seat.countDocuments({ isBooked: true }),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Seat.aggregate([
        { $match: { isBooked: true } },
        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDoc",
          },
        },
        { $unwind: { path: "$tableDoc", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$tableDoc.type",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    const tierMap = { PLATINUM: 0, VIP: 0, REGULAR: 0 };
    seatsByTier.forEach((row) => {
      if (row._id) tierMap[row._id] = row.count;
    });

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmed,
        pending,
        cancelled,
        checkedIn,
        students,
        discountsUsed,
        seatsSold,
        revenue,
        seatsByTier: {
          PLATINUM: tierMap.PLATINUM,
          VIP: tierMap.VIP,
          REGULAR: tierMap.REGULAR,
        },
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};

// GET /admin/activity  (read-only)
export const getActivity = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 250);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error("Admin activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log",
    });
  }
};
