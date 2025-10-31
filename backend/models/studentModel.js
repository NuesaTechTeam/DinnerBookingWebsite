import mongoose from "mongoose";

const engineeringStudentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    matricNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Civil Engineering",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Computer Engineering",
        "Chemical Engineering",
        "Petroluem Engineering",
        "Mechatronics Engineering",
        "Biomedical Engineering",
        "Aeronautics Engineering",
      ],
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["100L", "200L", "300L", "400L", "500L"],
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    amountPaid: {
      type: Number,
    },
    discountUsed: {
      type: Boolean,
      default: false,
    },
    discountUsedOn: {
      type: Date,
    },
    discountUsedForBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

engineeringStudentSchema.index({ email: 1 });
engineeringStudentSchema.index({ discountUsed: 1 });

export const Student = mongoose.model("Student", engineeringStudentSchema);
