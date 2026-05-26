const mongoose = require('mongoose');

const upcomingLessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  image: { type: String, default: '' }, // base64 or URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UpcomingLesson', upcomingLessonSchema);