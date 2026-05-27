const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, isVerified: false });
    await user.save();

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email });
    await new OTP({ email, otp }).save();

    // Send OTP email – with try/catch and rollback
    try {
      await sendEmail(email, 'LabNet OTP Verification', `Your OTP is: ${otp}`);
      console.log(`OTP sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Rollback: delete user and OTP record
      await User.deleteOne({ email });
      await OTP.deleteOne({ email });
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(201).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteOne({ email });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) return res.status(400).json({ message: 'Verify email first' });
    if (user.blocked) return res.status(403).json({ message: `Blocked: ${user.blockReason}` });
    if (user.role === 'student' && user.subscriptionStatus === 'active' && new Date(user.subscriptionEnd) < new Date()) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }
    const token = generateToken(user._id, user.email, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        labnetId: user.labnetId,
        blocked: user.blocked,
        blockReason: user.blockReason,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
};