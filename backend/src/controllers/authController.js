const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema, otpSchema } = require('../utils/validation');
const { sendOTPEmail } = require('../utils/nodemailerConfig');
const redisClient = require('../config/redis');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const register = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      name,
      email,
      password,
      role: 'user',
      profileImage: req.file ? req.file.path : '',
      isVerified: false,
    });
    await user.save();

    const otp = generateOTP();
    await redisClient.set(`otp:${user._id}`, otp, { EX: 300 });  // 5 minutes expiry
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'User registered. OTP sent to email. Please verify.',
      userId: user._id,  // Send userId for verify/resend
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {

  const { error } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userId, otp } = req.body;
  try {
    const storedOTP = await redisClient.get(`otp:${userId}`);
    console.log(`🔐 Stored OTP: ${storedOTP}, Provided OTP: ${otp}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await redisClient.del(`otp:${userId}`);

    const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

const resendOTP = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || user.isVerified) return res.status(400).json({ message: 'Invalid request' });

    const otp = generateOTP();
    await redisClient.set(`otp:${user._id}`, otp, { EX: 300 });
    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email with OTP' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, verifyOTP, resendOTP };