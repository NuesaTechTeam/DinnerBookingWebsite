import mongoose from "mongoose";

// An extra payment made outside a booking (e.g. settling a balance on a ticket).
// Created when the payer starts paying; marked paid only after Paystack confirms.
const topUpSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 1 },
    payerName: { type: String, required: true, trim: true },
    payerEmail: { type: String, required: true, lowercase: true, trim: true },
    // Optional: the booking this is for (its 6-digit entry code)
    entryCode: { type: String, trim: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    note: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const TopUp = mongoose.model("TopUp", topUpSchema);
