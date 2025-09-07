import rateLimit from "express-rate-limit";

// Auth rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 7, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 150, // Limit each IP to 150 requests per hour
  message: {
    success: false,
    message: "Too many requests from this IP",
  },
});
