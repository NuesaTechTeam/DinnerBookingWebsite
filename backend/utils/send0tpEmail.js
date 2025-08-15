// backend/utils/send0tpEmail.js
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");

// ====== CONNECT TO MONGO ======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ====== EMAIL TRANSPORTER ======
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ====== OTP GENERATOR ======
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// ====== MAIN FUNCTION ======
async function sendOtpEmail() {
  try {
    const filePath = path.join(__dirname, "../data/students.xlsx");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const studentsData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let sentCount = 0;
    let skippedCount = 0;

    for (let student of studentsData) {
      let existingStudent = await Student.findOne({ matricNumber: student.matricNumber });

      // Case 1: New student
      if (!existingStudent) {
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        const newStudent = new Student({
          name: student.name,
          matricNumber: student.matricNumber,
          email: student.email,
          otp,
          otpExpiry
        });

        await newStudent.save();
        await sendEmail(student.email, otp);
        sentCount++;
        continue;
      }

      // Case 2: Existing student but OTP expired
      if (!existingStudent.otpExpiry || existingStudent.otpExpiry < new Date()) {
        const otp = generateOtp();
        existingStudent.otp = otp;
        existingStudent.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await existingStudent.save();
        await sendEmail(existingStudent.email, otp);
        sentCount++;
        continue;
      }

      // Case 3: OTP still valid - skip
      skippedCount++;
    }

    console.log(`✅ Sent OTPs to ${sentCount} students`);
    console.log(`⏭ Skipped ${skippedCount} students (valid OTPs)`);
    process.exit();

  } catch (err) {
    console.error("❌ Error sending OTPs:", err);
    process.exit(1);
  }
}

// ====== EMAIL SENDER ======
async function sendEmail(to, otp) {
  const mailOptions = {
    from: `"School Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    text: `Hello, your OTP code is ${otp}. It will expire in 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
}

// Run script
sendOtpEmail();
