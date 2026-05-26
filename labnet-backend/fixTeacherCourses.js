// fixTeacherCourses.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Course = require('./models/Course');

const fixCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all teachers
    const teachers = await User.find({ role: 'teacher' });
    for (const teacher of teachers) {
      // Find all courses where teacherName matches but teacherId is missing/wrong
      const coursesToFix = await Course.find({ teacherName: teacher.name, teacherId: { $ne: teacher._id } });
      for (const course of coursesToFix) {
        course.teacherId = teacher._id;
        await course.save();
        console.log(`Fixed course "${course.title}" → assigned to teacher ${teacher.name} (${teacher._id})`);
      }
    }
    console.log('✅ All courses fixed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixCourses();