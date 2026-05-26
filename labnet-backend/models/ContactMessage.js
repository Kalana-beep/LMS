const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  senderEmail: String,
  senderRole: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  recipientType: { type: String, enum: ['admin', 'both'], required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  teacherName: { type: String, default: null },
  adminReply: { type: String, default: null },
  adminReplyDate: { type: Date, default: null },
  adminRepliedBy: { type: String, default: null },
  teacherReply: { type: String, default: null },
  teacherReplyDate: { type: Date, default: null },
  teacherRepliedBy: { type: String, default: null },
  status: { type: String, enum: ['pending', 'admin_replied', 'teacher_replied', 'both_replied'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactSchema);