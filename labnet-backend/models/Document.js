const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['worksheet', 'tutorial', 'note'], required: true },
  filePath: { type: String, required: true },
  publicId: { type: String, required: true },   // Must be present
  originalName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);