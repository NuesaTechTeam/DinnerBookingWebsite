import { getEngineeringDiscountPerSeat } from "../controllers/discountController.js";

// Customer-facing processing fee: 3% + ₦100, capped at ₦2,000.
// Must match calculateTotalAmount in frontend/src/components/Booking/CheckoutForm.jsx
export const customerTotal = (base) =>
  Math.round(base + Math.min(0.03 * base + 100, 2000));

// The price of a reservation, worked out from the seats themselves - never
// from anything the browser sends. `seats` must have `table` populated.
// `codeSeatIds` lists the seats the guest attached a verified discount code
// to; any codes without a (valid) seat go on the remaining seats with the
// biggest discount first.
export const priceSeats = (seats, codeCount = 0, codeSeatIds = [], promoDiscount = 0) => {
  const base = seats.reduce((sum, s) => sum + (s.table?.pricePerSeat || 0), 0);
  const discountFor = (s) =>
    Math.min(getEngineeringDiscountPerSeat(s.table?.type), s.table?.pricePerSeat || 0);

  const chosen = [];
  for (const id of codeSeatIds) {
    const seat = seats.find((s) => String(s._id) === String(id));
    if (seat && !chosen.includes(seat) && chosen.length < codeCount) chosen.push(seat);
  }
  const rest = seats
    .filter((s) => !chosen.includes(s))
    .sort((a, b) => discountFor(b) - discountFor(a));
  while (chosen.length < codeCount && rest.length) chosen.push(rest.shift());

  const discount = chosen.reduce((sum, s) => sum + discountFor(s), 0);
  const subtotal = Math.max(0, base - discount - promoDiscount);
  return { base, discount, promoDiscount, subtotal, total: customerTotal(subtotal) };
};
