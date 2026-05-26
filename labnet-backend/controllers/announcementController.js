const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

exports.createAnnouncement = async (req, res) => {
  try {
    const { courseId, message } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) return res.status(403).json({ message: 'Not your course' });
    const announcement = await Announcement.create({ courseId, message });
    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLatestAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 }).limit(10);
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    
    const course = await Course.findById(announcement.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const isOwner = course.teacherEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }
    
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};