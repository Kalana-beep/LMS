const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  subscriptionStatus: { type: String, enum: ['active', 'expired'], default: 'expired' },
  subscriptionEnd: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  blockReason: { type: String, default: null },
  blockedAt: { type: Date, default: null },
  profileImage: { type: String, default: '' },
  profileImagePublicId: { type: String, default: '' },
  // Teacher-specific fields
  bio: { type: String, default: '' },
  specialization: { type: String, default: '' },
  phone: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);