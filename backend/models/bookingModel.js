import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  matricNo: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  trxref: {
    type: String,
    unique: true,
  },
  paystackRef: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  seats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
    },
  ],
  paymentVerified: {
    type: Boolean,
    default: false,
  },
}, {timestamps: true});

export const Booking = mongoose.model("Booking", bookingSchema)