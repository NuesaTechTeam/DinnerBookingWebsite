require('dotenv').config(); // Load environment variables
const crypto = require('crypto');
const Student = require('../models/Student');
const Otp = require('../models/Otp'); // fixed filename
const sendOtpEmail = require('../utils/sendOtpEmail'); // fixed filename

exports.requestOtp = async (req, res) => {
    const { name, matricNumber, email } = req.body;

    try {
        // Check if student exists
        const student = await Student.findOne({ name, matricNumber, email });
        if (!student) {
            return res.status(404).json({ message: 'Student not found in records.' });
        }

        // Generate OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Save OTP with expiry (5 minutes)
        await Otp.create({
            email,
            otp: otpCode,
            createdAt: new Date()
        });

        // Send OTP email
        await sendOtpEmail(email, otpCode, process.env.EMAIL_USER, process.env.EMAIL_PASS);

        res.json({ message: 'OTP sent to your email.' });
    } catch (err) {
        console.error('Error in requestOtp:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Optionally check expiry (5 min)
        const isExpired = (Date.now() - otpRecord.createdAt.getTime()) > 5 * 60 * 1000;
        if (isExpired) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP expired.' });
        }

        // Delete OTP after verification
        await Otp.deleteOne({ _id: otpRecord._id });

        // Get student info
        const student = await Student.findOne({ email });
        res.json({ message: 'OTP verified successfully.', student });
    } catch (err) {
        console.error('Error in verifyOtp:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
