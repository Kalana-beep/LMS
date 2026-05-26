const UpcomingLesson = require('../models/UpcomingLesson');
const Course = require('../models/Course');

// Create an upcoming lesson (teacher only)
exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, description, scheduledDate, image } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) {
      return res.status(403).json({ message: 'You are not the teacher of this course' });
    }
    const lesson = await UpcomingLesson.create({
      courseId,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      image: image || '',
      createdBy: req.user.id
    });
    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get upcoming lessons for a course (any authenticated user)
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await UpcomingLesson.find({ courseId }).sort({ scheduledDate: 1 });
    res.json({ lessons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a lesson (teacher only)
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledDate, image } = req.body;
    const lesson = await UpcomingLesson.findById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.teacherEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (title) lesson.title = title;
    if (description) lesson.description = description;
    if (scheduledDate) lesson.scheduledDate = new Date(scheduledDate);
    if (image !== undefined) lesson.image = image;
    await lesson.save();
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a lesson (teacher only)
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await UpcomingLesson.findById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.teacherEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};