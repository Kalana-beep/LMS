const Video = require('../models/Video');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Upload video (teacher only)
exports.uploadVideo = async (req, res) => {
  try {
    const { courseId, title, description, youtubeUrl } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) return res.status(403).json({ message: 'Not your course' });
    
    // Validate YouTube URL
    if (!youtubeUrl.includes('youtube.com/watch?v=') && !youtubeUrl.includes('youtu.be/')) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    const video = await Video.create({ courseId, title, description, youtubeUrl });
    res.status(201).json({ video });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get video by ID (with strict access control)
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Admin and teacher have full access
    if (user.role === 'admin' || user.role === 'teacher') {
      return res.json({ video });
    }
    
    // Student must have active subscription AND be enrolled in the course
    if (user.role === 'student') {
      if (user.subscriptionStatus !== 'active') {
        return res.status(403).json({ message: 'Active subscription required to watch videos' });
      }
      const course = await Course.findById(video.courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      const enrollment = await Enrollment.findOne({ studentId: user._id, courseId: course._id });
      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }
      return res.json({ video });
    }
    
    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete video (teacher/admin)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const course = await Course.findById(video.courseId);
    if (course.teacherEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};