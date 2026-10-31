import crypto from "crypto";
import jwt from "jsonwebtoken";

// Bookings are closed to the public. Set BOOKINGS_CLOSED=false in the server's
// environment (Render -> Environment) to reopen without a code change.
export const bookingsClosed = () => process.env.BOOKINGS_CLOSED !== "false";

export const CLOSED_MESSAGE =
  "Thank you! Bookings for FÀÁJÍ LAWA are now closed.";

const getSecret = () => process.env.ADMIN_JWT_SECRET || process.env.REGISTER_TOKEN;

// The phrase that lets one visitor book while bookings are closed is not stored
// anywhere in the code - only its SHA-256 fingerprint, the same one the page uses.
const PHRASE_FINGERPRINT =
  "aa838baa048b2ca558d671b30f8c0a2ef7eeec70502a6fffccaefa837da07661";

const phraseMatches = (phrase) => {
  const typed = String(phrase || "").trim().toUpperCase();
  if (!typed) return false;
  const fingerprint = crypto.createHash("sha256").update(typed).digest();
  const expected = Buffer.from(PHRASE_FINGERPRINT, "hex");
  return crypto.timingSafeEqual(fingerprint, expected);
};

// A pass is a short-lived signed token the browser sends as x-booking-pass
export const hasBookingPass = (req) => {
  const token = req.headers["x-booking-pass"];
  const secret = getSecret();
  if (!token || !secret) return false;
  try {
    return jwt.verify(String(token), secret).kind === "booking-pass";
  } catch {
    return false;
  }
};

// Returns true (after answering 403) when the request must be stopped
export const blockIfClosed = (req, res) => {
  if (bookingsClosed() && !hasBookingPass(req)) {
    res.status(403).json({ success: false, closed: true, message: CLOSED_MESSAGE });
    return true;
  }
  return false;
};

// GET /booking/status - lets the page decide what to show
export const bookingStatus = (req, res) => {
  res.json({ success: true, closed: bookingsClosed() });
};

// POST /booking/pass { phrase } - hands out a 12-hour pass for the right phrase
export const issueBookingPass = (req, res) => {
  const secret = getSecret();
  if (!secret || !phraseMatches(req.body?.phrase)) {
    // Same answer as any unknown route so nothing hints that this one exists
    return res.status(404).json({ success: false, message: "Not found" });
  }
  const token = jwt.sign({ kind: "booking-pass" }, secret, { expiresIn: "12h" });
  res.json({ success: true, token });
};
