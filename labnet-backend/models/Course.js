const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  day: String,
  startTime: String,
  endTime: String
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacherEmail: { type: String, required: true, lowercase: true },
  teacherName: { type: String, required: true },
  timetable: [timetableSchema],
  image: { type: String, default: '' },
  category: { type: String, enum: ['ol', 'al'], required: true }
});

// Compound unique index: same teacher cannot have duplicate course titles
courseSchema.index({ teacherEmail: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);