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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (unverified)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      role: 'student' // default role
    });
    await user.save();

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email }); // remove any previous OTP
    await new OTP({ email, otp }).save();

    // Send OTP email
    try {
      await sendEmail(email, 'LabNet OTP Verification', `Your OTP is: ${otp}`);
      console.log(`OTP sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Rollback: delete the created user and OTP record
      await User.deleteOne({ email });
      await OTP.deleteOne({ email });
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(201).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find valid OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteOne({ email }); // clean up OTP

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({
        message: `Your account has been blocked. Reason: ${user.blockReason || 'No reason provided'}. Contact admin.`
      });
    }

    // For students: auto‑expire subscription if end date passed
    if (user.role === 'student' && user.subscriptionStatus === 'active' && user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token (includes email)
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
        blockReason: user.blockReason
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};