import jwt from "jsonwebtoken";
import { AdminUser } from "../models/adminUserModel.js";

const getSecret = () =>
  process.env.ADMIN_JWT_SECRET || process.env.REGISTER_TOKEN;

export const signAdminToken = (user) => {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Admin token secret missing (set ADMIN_JWT_SECRET or REGISTER_TOKEN)"
    );
  }
  const username = typeof user === "string" ? user : user.username;
  const payload = {
    sub: username,
    role: (typeof user === "object" && user.role) || "admin",
  };
  if (typeof user === "object" && user._id) {
    payload.uid = String(user._id);
  }
  return jwt.sign(payload, secret, { expiresIn: "12h" });
};

export const requireAdmin = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required",
    });
  }

  try {
    const secret = getSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        message: "Admin authentication is not configured",
      });
    }

    const payload = jwt.verify(token, secret);
    if (payload.role !== "admin" && payload.role !== "super") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin session",
      });
    }

    // Check the account still exists, is active, and use its current role so
    // deactivation/demotion takes effect immediately (not after 12h)
    if (payload.uid) {
      const user = await AdminUser.findById(payload.uid).select(
        "isActive role username"
      );
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "This admin account is no longer active",
        });
      }
      payload.role = user.role;
      payload.sub = user.username;
    }

    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session",
    });
  }
};

// Must run after requireAdmin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "super") {
    return res.status(403).json({
      success: false,
      message: "Super admin access required",
    });
  }
  next();
};
