const express = require('express');
const {
  sendMessage,
  teacherSendToAdmin,
  getMyMessages,
  getAllMessages,
  adminReply,
  teacherReply,
  deleteMessage,
  getStudentTeachers
} = require('../controllers/contactController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Student sends message
router.post('/send', auth, sendMessage);

// Teacher sends message to admin
router.post('/teacher-send', auth, roleCheck('teacher'), teacherSendToAdmin);

// Get logged-in user's messages
router.get('/my-messages', auth, getMyMessages);

// Get student's enrolled teachers (for dropdown)
router.get('/my-teachers', auth, roleCheck('student'), getStudentTeachers);

// Admin routes
router.get('/admin/all', auth, roleCheck('admin'), getAllMessages);
router.post('/admin/reply/:messageId', auth, roleCheck('admin'), adminReply);
router.delete('/admin/:messageId', auth, roleCheck('admin'), deleteMessage);

// Teacher reply
router.post('/teacher/reply/:messageId', auth, roleCheck('teacher'), teacherReply);

module.exports = router;