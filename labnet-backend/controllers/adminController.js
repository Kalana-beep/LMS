const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Video = require('../models/Video');
const Announcement = require('../models/Announcement');
const Document = require('../models/Document');
const ContactMessage = require('../models/ContactMessage');
const bcrypt = require('bcryptjs');

// Get dashboard stats (exclude blocked students)
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isVerified: true, blocked: false });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isVerified: true });
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const activeSubscriptions = await User.countDocuments({ role: 'student', subscriptionStatus: 'active', isVerified: true, blocked: false });
    const totalEnrollments = await Enrollment.countDocuments({
      studentId: { $in: await User.find({ role: 'student', blocked: false }).distinct('_id') }
    });
    res.json({ totalStudents, totalTeachers, totalCourses, totalVideos, activeSubscriptions, totalEnrollments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: true }).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { role, subscriptionStatus, subscriptionEnd, blocked, blockReason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (role) user.role = role;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionEnd) user.subscriptionEnd = new Date(subscriptionEnd);
    if (blocked !== undefined) {
      user.blocked = blocked;
      user.blockReason = blocked ? blockReason || 'No reason' : null;
      user.blockedAt = blocked ? new Date() : null;
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block user – delete enrollments
exports.blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'student') {
      await Enrollment.deleteMany({ studentId: user._id });
    }
    user.blocked = true;
    user.blockReason = reason || 'No reason';
    user.blockedAt = new Date();
    await user.save();
    res.json({ message: 'User blocked and enrollments removed', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.blocked = false;
    user.blockReason = null;
    user.blockedAt = null;
    await user.save();
    res.json({ message: 'User unblocked', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate subscription manually
exports.activateSubscriptionManually = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    user.subscriptionStatus = 'active';
    user.subscriptionEnd = endDate;
    await user.save();
    res.json({ message: 'Subscription activated for 30 days', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Expire subscription
exports.expireSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.subscriptionStatus = 'expired';
    user.subscriptionEnd = null;
    await user.save();
    res.json({ message: 'Subscription expired', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    if (user.role === 'student') {
      await Enrollment.deleteMany({ studentId: user._id });
    } else if (user.role === 'teacher') {
      const courses = await Course.find({ teacherEmail: user.email });
      const courseIds = courses.map(c => c._id);
      await Video.deleteMany({ courseId: { $in: courseIds } });
      await Announcement.deleteMany({ courseId: { $in: courseIds } });
      await Document.deleteMany({ courseId: { $in: courseIds } });
      await Enrollment.deleteMany({ courseId: { $in: courseIds } });
      await Course.deleteMany({ teacherEmail: user.email });
    }
    await ContactMessage.deleteMany({ senderId: user._id });
    await user.deleteOne();
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin get all courses
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin create course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, teacherEmail, image, category } = req.body;
    const teacher = await User.findOne({ email: teacherEmail.toLowerCase(), role: 'teacher' });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const course = await Course.create({
      title,
      description,
      teacherEmail: teacher.email,
      teacherName: teacher.name,
      image: image || '',
      category: category || 'ol'
    });
    res.status(201).json({ course });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'This teacher already has a course with the same title' });
    res.status(500).json({ message: err.message });
  }
};

// Admin update course
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, teacherEmail, timetable, image, category } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    let newTeacherEmail = course.teacherEmail;
    if (teacherEmail && teacherEmail !== course.teacherEmail) {
      const teacher = await User.findOne({ email: teacherEmail.toLowerCase(), role: 'teacher' });
      if (!teacher) return res.status(400).json({ message: 'Teacher not found' });
      newTeacherEmail = teacher.email;
      course.teacherName = teacher.name;
    }
    if ((title && title !== course.title) || (teacherEmail && teacherEmail !== course.teacherEmail)) {
      const existing = await Course.findOne({
        teacherEmail: newTeacherEmail,
        title: title || course.title,
        _id: { $ne: course._id }
      });
      if (existing) return res.status(400).json({ message: 'This teacher already has a course with the same title' });
    }
    if (title) course.title = title;
    if (description) course.description = description;
    if (teacherEmail) course.teacherEmail = newTeacherEmail;
    if (timetable) course.timetable = timetable;
    if (image !== undefined) course.image = image;
    if (category) course.category = category;
    await course.save();
    res.json({ course });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'This teacher already has a course with the same title' });
    res.status(500).json({ message: err.message });
  }
};

// Admin delete course
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teachers (for course assignment dropdown)
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isVerified: true }).select('name email');
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Analytics – exclude blocked students
exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isVerified: true, blocked: false });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isVerified: true });
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const activeSubscriptions = await User.countDocuments({ role: 'student', subscriptionStatus: 'active', isVerified: true, blocked: false });
    const nonBlockedStudentIds = await User.find({ role: 'student', blocked: false }).distinct('_id');
    const totalEnrollments = await Enrollment.countDocuments({ studentId: { $in: nonBlockedStudentIds } });
    const popularCourses = await Enrollment.aggregate([
      { $match: { studentId: { $in: nonBlockedStudentIds } } },
      { $group: { _id: '$courseId', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { title: '$course.title', enrollments: 1 } }
    ]);
    res.json({ totalStudents, totalTeachers, totalCourses, totalVideos, totalEnrollments, activeSubscriptions, popularCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== TEACHER MANAGEMENT FUNCTIONS ==========

// Get all teachers (for admin panel)
exports.getTeachersList = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin creates a teacher account
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, bio, specialization, phone, profileImage } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      isVerified: true,
      bio: bio || '',
      specialization: specialization || '',
      phone: phone || '',
      profileImage: profileImage || '',
      isPublic: true
    });
    const teacherWithoutPassword = teacher.toObject();
    delete teacherWithoutPassword.password;
    res.status(201).json({ teacher: teacherWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin updates a teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { name, email, bio, specialization, phone, profileImage, isPublic } = req.body;
    const teacher = await User.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (teacher.role !== 'teacher') return res.status(400).json({ message: 'User is not a teacher' });
    if (name) teacher.name = name;
    if (email && email !== teacher.email) {
      const existing = await User.findOne({ email, _id: { $ne: teacher._id } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      teacher.email = email;
    }
    if (bio !== undefined) teacher.bio = bio;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (phone !== undefined) teacher.phone = phone;
    if (profileImage !== undefined) teacher.profileImage = profileImage;
    if (isPublic !== undefined) teacher.isPublic = isPublic;
    await teacher.save();
    const teacherWithoutPassword = teacher.toObject();
    delete teacherWithoutPassword.password;
    res.json({ teacher: teacherWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin deletes a teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (teacher.role !== 'teacher') return res.status(400).json({ message: 'User is not a teacher' });
    await teacher.deleteOne();
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};