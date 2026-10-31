// Tiers closed to NEW online bookings (REGULAR = Bronze, VIP = Gold, VVIP = Platinum).
// Existing bookings, payments already in progress and organiser tools such as
// utils/createComp.js are not affected. Keep in sync with CLOSED_TIERS in
// frontend/src/components/Booking/SeatSelection.jsx. To reopen a tier, remove it
// from both lists and redeploy.
export const CLOSED_TIERS = ["REGULAR"];
export const isTierClosed = (type) => CLOSED_TIERS.includes(type);
export const TIER_LABEL = { VVIP: "Platinum", VIP: "Gold", REGULAR: "Bronze" };
