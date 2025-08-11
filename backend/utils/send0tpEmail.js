const nodemailer = require('nodemailer');

async function sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"NUESA Dinner" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your NUESA Dinner OTP',
        text: `Your NUESA Dinner OTP is ${otp}. It expires in 5 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Error sending OTP email:', err);
    }
}

module.exports = sendOtpEmail;
