const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Video = require('../models/Video');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Get all courses (public)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get course by ID (public)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get videos for a course (public)
exports.getCourseVideos = async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.id });
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get announcements for a course (public)
exports.getCourseAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ courseId: req.params.id }).sort({ date: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student enrolls in a course – prevent blocked students
exports.enrollCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.blocked) return res.status(403).json({ message: 'Your account is blocked. Cannot enroll.' });
    if (user.role !== 'student') return res.status(403).json({ message: 'Only students can enroll' });
    const existing = await Enrollment.findOne({ studentId: req.user.id, courseId: req.params.id });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    await Enrollment.create({ studentId: req.user.id, courseId: req.params.id });
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get enrolled courses for student (only non‑blocked students)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.blocked) return res.json({ courses: [] });
    const enrollments = await Enrollment.find({ studentId: req.user.id }).populate('courseId');
    const coursesWithTeacher = await Promise.all(enrollments.map(async (e) => {
      const course = e.courseId._doc;
      const teacher = await User.findOne({ email: course.teacherEmail }).select('_id name');
      return {
        ...course,
        progress: e.progress,
        teacherId: teacher?._id || null,
        teacherName: teacher?.name || course.teacherName
      };
    }));
    res.json({ courses: coursesWithTeacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if student is enrolled (also checks block status)
exports.checkEnrollment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.blocked) {
      return res.json({ enrolled: false });
    }
    const enrolled = await Enrollment.exists({ studentId: req.user.id, courseId: req.params.courseId });
    res.json({ enrolled: !!enrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get courses for a teacher (by email)
exports.getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacherEmail: req.user.email.toLowerCase() });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher courses with stats – exclude blocked students from student count
exports.getTeacherCoursesWithStats = async (req, res) => {
  try {
    const courses = await Course.find({ teacherEmail: req.user.email.toLowerCase() });
    const nonBlockedStudentIds = await User.find({ role: 'student', blocked: false }).distinct('_id');
    const enriched = await Promise.all(courses.map(async (c) => {
      const videosCount = await Video.countDocuments({ courseId: c._id });
      const studentsCount = await Enrollment.countDocuments({
        courseId: c._id,
        studentId: { $in: nonBlockedStudentIds }
      });
      return { ...c._doc, videosCount, studentsCount };
    }));
    res.json({ courses: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher stats summary – exclude blocked students
exports.getTeacherStatsSummary = async (req, res) => {
  try {
    const courses = await Course.find({ teacherEmail: req.user.email.toLowerCase() });
    const totalCourses = courses.length;
    const courseIds = courses.map(c => c._id);
    const totalVideos = await Video.countDocuments({ courseId: { $in: courseIds } });
    const nonBlockedStudentIds = await User.find({ role: 'student', blocked: false }).distinct('_id');
    const totalStudents = await Enrollment.distinct('studentId', {
      courseId: { $in: courseIds },
      studentId: { $in: nonBlockedStudentIds }
    }).then(arr => arr.length);
    res.json({ totalCourses, totalVideos, totalStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update course timetable (teacher)
exports.updateCourseTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) return res.status(403).json({ message: 'Not your course' });
    course.timetable = timetable;
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update course details (teacher)
exports.updateTeacherCourse = async (req, res) => {
  try {
    const { title, description, timetable, image } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) return res.status(403).json({ message: 'Not your course' });
    if (title && title !== course.title) {
      const existing = await Course.findOne({ teacherEmail: req.user.email, title, _id: { $ne: course._id } });
      if (existing) return res.status(400).json({ message: 'You already have a course with this title' });
      course.title = title;
    }
    if (description) course.description = description;
    if (timetable) course.timetable = timetable;
    if (image !== undefined) course.image = image;
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};