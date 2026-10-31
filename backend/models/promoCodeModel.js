import mongoose from "mongoose";

// A percentage-off code the organisers hand out (e.g. 50% off Bronze seats).
// Usage is counted live from reservations (pending + confirmed), so an unpaid
// reservation that expires frees its seats again.
const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    label: { type: String, trim: true },
    percentOff: { type: Number, required: true, min: 1, max: 100 },
    // Seat tiers the code works on: REGULAR (Bronze), VIP (Gold), VVIP (Platinum)
    tiers: [{ type: String, enum: ["REGULAR", "VIP", "VVIP"] }],
    // Most discounted seats across ALL bookings, and per single booking
    maxUses: { type: Number, required: true, min: 1 },
    perBookingMax: { type: Number, default: 1, min: 1 },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    // Bumped inside the booking transaction so two people can't take the last
    // discounted seat at the same moment
    touches: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
