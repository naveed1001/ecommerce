const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP } = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 40,  // 40 requests per hour
  message: 'Too many resend requests, please try again later.',
});

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendLimiter, resendOTP);

module.exports = router;