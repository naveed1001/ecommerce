const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // For development; remove in production if possible
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Registration Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Welcome to Our E-commerce Platform!</h2>
        <p>Dear User,</p>
        <p>Thank you for registering. To complete your registration, please use the following One-Time Password (OTP):</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">${otp}</div>
        <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>E-commerce Team</p>
        <hr style="border: none; border-top: 1px solid #eee;"/>
        <p style="text-align: center; font-size: 12px; color: #999;">© 2025 E-commerce Inc. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };