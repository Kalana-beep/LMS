const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ==================== REGISTRATION ====================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email });
    await new OTP({ email, otp, userData: { name, email, password: hashedPassword } }).save();
    await sendEmail(email, 'Sigma OTP Verification', `Your OTP is: ${otp}\n\nValid for 10 minutes.`);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP' });
    const { name, password } = record.userData;
    const user = new User({ name, email, password, isVerified: true });
    await user.save();
    await OTP.deleteOne({ email });
    res.json({ message: 'Email verified and account created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first' });
    if (user.blocked) return res.status(403).json({ message: `Account blocked. Reason: ${user.blockReason || 'No reason provided'}` });
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
        subscriptionEnd: user.subscriptionEnd,
        profileImage: user.profileImage,
        blocked: user.blocked,
        blockReason: user.blockReason
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ message: 'If your email is registered, you will receive an OTP' });
    }
    // Delete any existing OTP for this email
    await OTP.findOneAndDelete({ email });
    const otp = generateOTP();
    await new OTP({ email, otp, userData: { purpose: 'password_reset' } }).save();
    await sendEmail(email, 'Sigma Password Reset OTP', `Your OTP to reset your password is: ${otp}\n\nValid for 10 minutes.`);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const record = await OTP.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await OTP.deleteOne({ email });
    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};