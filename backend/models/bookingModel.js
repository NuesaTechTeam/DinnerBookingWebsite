import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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
      required: true, //Base amount without fees
    },
    totalAmount: {
      type: Number,
      required: true, // Total amount with fees
    },
    isEngineering: {
      type: Boolean,
      default: false,
    },
    trxref: {
      type: String,
      unique: true,
      sparse: true,
    },
    paystackRef: {
      type: String,
      unique: true,
      sparse: true,
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
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema)