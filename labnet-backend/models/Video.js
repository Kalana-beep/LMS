const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  youtubeUrl: { type: String, required: true }, // Store YouTube URL
  description: { type: String }
});

module.exports = mongoose.model('Video', videoSchema);