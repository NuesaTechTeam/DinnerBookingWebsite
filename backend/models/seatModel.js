import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  isGivenTicket: {
    type: Boolean,
    default: false,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  reservedFor: {
    type: String,
    default: "",
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  lockedUntil: {
    type: Date,
    default: null,
  },
}, {timestamps: true});

seatSchema.index({table: 1, seatNumber: 1}, {unique: true})

export const Seat = mongoose.model("Seat", seatSchema)