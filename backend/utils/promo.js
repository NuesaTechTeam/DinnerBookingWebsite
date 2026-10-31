import { PromoCode } from "../models/promoCodeModel.js";
import { Booking } from "../models/bookingModel.js";
import { TIER_LABEL } from "../config/closedTiers.js";

export const normalizePromo = (code) => String(code || "").trim().toUpperCase();

// Looks a code up and works out how many discounted seats are left
export const getPromoStatus = async (code, session = null) => {
  const promo = await PromoCode.findOne({ code: normalizePromo(code) }).session(session);
  if (!promo) return { promo: null, used: 0, remaining: 0 };
  const agg = await Booking.aggregate([
    { $match: { promoCode: promo.code, status: { $in: ["pending", "confirmed"] } } },
    { $group: { _id: null, seats: { $sum: "$promoSeats" } } },
  ]).session(session);
  const used = agg[0]?.seats || 0;
  return { promo, used, remaining: Math.max(0, promo.maxUses - used) };
};

// Why this code can't be used on these seats, or null if it can
export const promoProblem = ({ promo, remaining }, tiers = []) => {
  if (!promo) return "That promo code isn't valid.";
  if (!promo.active) return "That promo code is no longer active.";
  if (promo.expiresAt && promo.expiresAt < new Date()) return "That promo code has expired.";
  if (remaining <= 0) return "That promo code has been fully used.";
  const wrong = tiers.filter((t) => t && !promo.tiers.includes(t));
  if (wrong.length) {
    const ok = promo.tiers.map((t) => TIER_LABEL[t] || t).join(" / ");
    return `That promo code only works on ${ok} seats.`;
  }
  return null;
};

// Discount for a booking: up to perBookingMax seats (and what is left under
// the cap) get percentOff, the rest pay full price. Mirrors the checkout form.
export const promoDiscountFor = (seats, promo, remaining) => {
  const eligible = seats.filter((s) => promo.tiers.includes(s.table?.type));
  const n = Math.min(eligible.length, promo.perBookingMax, remaining);
  const discount = eligible
    .slice(0, n)
    .reduce((sum, s) => sum + Math.round(((s.table?.pricePerSeat || 0) * promo.percentOff) / 100), 0);
  return { seatsDiscounted: n, discount };
};
