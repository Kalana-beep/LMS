const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Announcement', announcementSchema);