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
    discountApplied: {
      type: Boolean,
      default: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    engineeringStudentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EngineeringStudent",
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
    attendanceVerified: {
      type: Boolean,
      default: false,
    },
    attendanceVerifiedAt: {
      type: Date,
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