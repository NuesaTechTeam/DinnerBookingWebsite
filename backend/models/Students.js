// backend/models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  matricNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpiry: { type: Date }
});

module.exports = mongoose.model("Student", studentSchema);
