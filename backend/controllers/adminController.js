import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import { Student } from "../models/studentModel.js";
import { AdminUser } from "../models/adminUserModel.js";
import { ActivityLog } from "../models/activityLogModel.js";
import { logActivity } from "../utils/activity.js";
import { sendConfirmationEmail } from "../utils/emailService.js";
import { signAdminToken } from "../middlewares/adminAuth.js";

const USERNAME_RE = /^[a-z0-9_.-]{3,24}$/;
const MIN_PASSWORD_LENGTH = 8;

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

// POST /admin/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const clean = String(username).toLowerCase().trim();
    const user = await AdminUser.findOne({ username: clean });

    const denied = async (message) => {
      await logActivity(
        "admin_login_failed",
        `Failed login attempt for "${clean.slice(0, 40)}"`
      );
      return res.status(401).json({ success: false, message });
    };

    if (!user || !user.isActive) {
      return await denied("Invalid username or password");
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return await denied("Invalid username or password");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signAdminToken(user);
    await logActivity("admin_login", `${user.username} logged in`);

    res.json({
      success: true,
      token,
      admin: user.username,
      role: user.role,
      expiresIn: "12h",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// GET /admin/lookup?code=...  - resolve a scanned QR / typed booking code
export const lookupBooking = async (req, res) => {
  try {
    const raw = String(req.query.code || "").trim();
    if (!raw) {
      return res.status(400).json({
        success: false,
        message: "Provide a booking code",
      });
    }

    // Accept a full verify URL (what the QR contains), a full id, or the
    // short 8-character reference shown on the ticket
    const urlMatch = raw.match(/verify\/([a-f0-9]{24})/i);
    const code = (urlMatch ? urlMatch[1] : raw).replace(/^#/, "").trim();

    let filter = null;
    if (/^\d{6,8}$/.test(code)) {
      // Short human-typeable code printed on the ticket email
      filter = { code };
    } else if (/^[a-f0-9]{24}$/i.test(code)) {
      filter = { _id: code };
    } else if (/^[a-f0-9]{4,23}$/i.test(code)) {
      filter = {
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: `${code}$`,
            options: "i",
          },
        },
      };
    }

    if (!filter) {
      return res.status(400).json({
        success: false,
        message: "That does not look like a valid booking code",
      });
    }

    const booking = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .populate({
        path: "seats",
        populate: { path: "table", model: "Table" },
      });

    if (!booking || booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No booking found for that code",
      });
    }

    res.json({ success: true, data: booking[0] });
  } catch (error) {
    console.error("Admin lookup booking error:", error);
    res.status(500).json({ success: false, message: "Lookup failed" });
  }
};

// POST /admin/resend/:bookingId  - re-email a guest their ticket
export const resendConfirmation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const sent = await sendConfirmationEmail(booking);
    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "The email could not be sent. Please try again.",
      });
    }

    await logActivity(
      "ticket_resent",
      `${req.admin?.sub || "admin"} resent the ticket to ${booking.email} [${booking._id}]`
    );

    res.json({
      success: true,
      message: `Ticket emailed to ${booking.email}`,
    });
  } catch (error) {
    console.error("Admin resend confirmation error:", error);
    res.status(500).json({ success: false, message: "Failed to resend ticket" });
  }
};

// GET /admin/users  (super admin)
export const listUsers = async (req, res) => {
  try {
    const users = await AdminUser.find().select("-passwordHash").sort({ createdAt: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Admin list users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// POST /admin/users  (super admin)
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body || {};
    const clean = String(username || "").toLowerCase().trim();

    if (!USERNAME_RE.test(clean)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-24 characters (a-z, 0-9, . _ -)",
      });
    }

    if (String(password || "").length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (role && !["super", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'admin' or 'super'",
      });
    }

    const exists = await AdminUser.findOne({ username: clean });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await AdminUser.create({
      username: clean,
      passwordHash,
      role: role || "admin",
      isActive: true,
    });

    await logActivity(
      "admin_user_created",
      `${req.admin?.sub || "super admin"} created ${user.role} account "${clean}"`
    );

    res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

// PATCH /admin/users/:id  (super admin)  body: { isActive?, password? }
export const updateUser = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { isActive, password } = req.body || {};
    const isSelf = req.admin?.uid === String(user._id);
    const changes = [];

    if (typeof isActive === "boolean") {
      if (isSelf) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own active status",
        });
      }

      if (!isActive && user.role === "super") {
        const otherActiveSupers = await AdminUser.countDocuments({
          role: "super",
          isActive: true,
          _id: { $ne: user._id },
        });
        if (otherActiveSupers === 0) {
          return res.status(400).json({
            success: false,
            message: "You cannot deactivate the last super admin",
          });
        }
      }

      user.isActive = isActive;
      changes.push(isActive ? "activated" : "deactivated");
    }

    if (password !== undefined && password !== "") {
      if (String(password).length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        });
      }
      user.passwordHash = await bcrypt.hash(String(password), 12);
      changes.push("password reset");
    }

    if (changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    await user.save();

    await logActivity(
      changes.includes("password reset") ? "admin_user_password_reset" : "admin_user_status",
      `${req.admin?.sub || "super admin"} ${changes.join(" & ")} user "${user.username}"`
    );

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
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
