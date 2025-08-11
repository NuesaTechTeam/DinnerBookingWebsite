const crypto = require('crypto');
const Student = require('../models/Student');
const Otp = require('../models/0tp');
const sendOtpEmail = require('../utils/send0tpEmail');

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

        // Save OTP
        await Otp.create({ email, otp: otpCode });

        // Send OTP email
        await sendOtpEmail(email, otpCode);

        res.json({ message: 'OTP sent to your email.' });
    } catch (err) {
        console.error(err);
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

        // Delete OTP after verification
        await Otp.deleteOne({ _id: otpRecord._id });

        // Get student info
        const student = await Student.findOne({ email });
        res.json({ message: 'OTP verified successfully.', student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
