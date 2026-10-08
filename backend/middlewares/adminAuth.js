import jwt from "jsonwebtoken";

const getSecret = () =>
  process.env.ADMIN_JWT_SECRET || process.env.REGISTER_TOKEN;

export const signAdminToken = (username) => {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Admin token secret missing (set ADMIN_JWT_SECRET or REGISTER_TOKEN)"
    );
  }
  return jwt.sign({ sub: username, role: "admin" }, secret, {
    expiresIn: "12h",
  });
};

export const requireAdmin = (req, res, next) => {
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
    if (payload.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin session",
      });
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
