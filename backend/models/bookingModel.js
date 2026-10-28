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
    // Every engineering discount code used - one per discounted seat.
    // couponCode keeps the first one for older screens and scripts.
    couponCodes: [{ type: String, trim: true, uppercase: true }],
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    engineeringStudentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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
    // One meal choice per reserved seat (guest picks their own meal).
    meals: [
      {
        seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
        choice: { type: String, trim: true },
      },
    ],
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    // Ticket email tracking. "sent" = Brevo accepted it, "delivered" = Brevo
    // reports it reached the inbox (synced from Brevo's event log).
    emailStatus: {
      type: String,
      enum: ["not_sent", "sent", "delivered", "failed"],
      default: "not_sent",
    },
    emailSentAt: { type: Date },
    emailLastAttemptAt: { type: Date },
    emailMessageId: { type: String },
    emailError: { type: String },
    emailAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema)