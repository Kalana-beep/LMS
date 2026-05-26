const mongoose = require('mongoose');

const videoQuestionSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: null },
  answeredAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoQuestion', videoQuestionSchema);