const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  userData: { type: Object, default: null }, // stores name & hashed password temporarily
  expiresAt: { type: Date, required: true, default: () => Date.now() + 10 * 60 * 1000 } // 10 minutes
});

module.exports = mongoose.model('OTP', otpSchema);