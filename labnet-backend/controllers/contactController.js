const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Student sends message (to admin or admin+teacher)
exports.sendMessage = async (req, res) => {
  try {
    const { subject, message, recipientType, teacherId, courseId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let teacher = null;
    if (recipientType === 'both') {
      if (!teacherId) return res.status(400).json({ message: 'Teacher ID required' });
      teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') return res.status(400).json({ message: 'Invalid teacher' });
      if (!courseId) return res.status(400).json({ message: 'Course ID required' });
      const enrollment = await Enrollment.findOne({ studentId: user._id, courseId });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const contact = await ContactMessage.create({
      senderId: user._id,
      senderName: user.name,
      senderEmail: user.email,
      senderRole: user.role,
      subject,
      message,
      recipientType,
      teacherId: teacher?._id || null,
      teacherName: teacher?.name || null,
      status: 'pending'
    });
    res.status(201).json({ contact });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Teacher sends message to admin only
exports.teacherSendToAdmin = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can use this' });

    const contact = await ContactMessage.create({
      senderId: user._id,
      senderName: user.name,
      senderEmail: user.email,
      senderRole: 'teacher',
      subject,
      message,
      recipientType: 'admin',
      teacherId: null,
      status: 'pending'
    });
    res.status(201).json({ contact });
  } catch (err) {
    console.error('Teacher send error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages for logged-in user
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'admin') {
      query = {};
    } else if (userRole === 'teacher') {
      query = { $or: [{ senderId: userId }, { teacherId: userId }] };
    } else if (userRole === 'student') {
      query = { senderId: userId };
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    const messages = await ContactMessage.find(query)
      .setOptions({ strictPopulate: false })
      .populate('senderId', 'name email role')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin reply
exports.adminReply = async (req, res) => {
  try {
    const { reply } = req.body;
    const messageId = req.params.messageId;
    
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      messageId,
      {
        adminReply: reply,
        adminReplyDate: new Date(),
        adminRepliedBy: admin.name,
      },
      { new: true, runValidators: false }
    );

    if (!updatedMessage) return res.status(404).json({ message: 'Message not found' });

    const newStatus = updatedMessage.teacherReply ? 'both_replied' : 'admin_replied';
    await ContactMessage.findByIdAndUpdate(messageId, { status: newStatus }, { runValidators: false });

    res.json({ message: 'Reply sent', contact: updatedMessage });
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Teacher reply
exports.teacherReply = async (req, res) => {
  try {
    const { reply } = req.body;
    const messageId = req.params.messageId;
    
    const message = await ContactMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    if (message.teacherId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the intended teacher recipient' });
    }
    
    if (message.teacherReply) {
      return res.status(400).json({ message: 'You already replied to this message' });
    }

    const teacher = await User.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      messageId,
      {
        teacherReply: reply,
        teacherReplyDate: new Date(),
        teacherRepliedBy: teacher.name,
      },
      { new: true, runValidators: false }
    );

    const newStatus = updatedMessage.adminReply ? 'both_replied' : 'teacher_replied';
    await ContactMessage.findByIdAndUpdate(messageId, { status: newStatus }, { runValidators: false });

    res.json({ message: 'Reply sent to student', contact: updatedMessage });
  } catch (err) {
    console.error('Teacher reply error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({})
      .setOptions({ strictPopulate: false })
      .populate('senderId', 'name email role')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    console.error('Get all messages error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get enrolled teachers for a student (for dropdown)
exports.getStudentTeachers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const enrollments = await Enrollment.find({ studentId }).populate('courseId');
    const courseIds = enrollments.map(e => e.courseId?._id).filter(Boolean);
    const courses = await Course.find({ _id: { $in: courseIds } });
    const teacherEmails = [...new Set(courses.map(c => c.teacherEmail))];
    const teachers = await User.find({ email: { $in: teacherEmails }, role: 'teacher' }).select('_id name email');
    res.json({ teachers });
  } catch (err) {
    console.error('Get student teachers error:', err);
    res.status(500).json({ message: err.message });
  }
};