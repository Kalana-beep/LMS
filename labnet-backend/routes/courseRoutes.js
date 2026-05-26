const express = require('express');
const {
  getAllCourses,
  getCourseById,
  getCourseVideos,
  getCourseAnnouncements,
  enrollCourse,
  getEnrolledCourses,
  checkEnrollment,
  getTeacherCourses,
  getTeacherCoursesWithStats,
  getTeacherStatsSummary,
  updateCourseTimetable
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const subscriptionCheck = require('../middleware/subscriptionCheck');

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:id/videos', getCourseVideos);
router.get('/:id/announcements', getCourseAnnouncements);

// Student routes (require auth + subscription)
router.post('/:id/enroll', auth, roleCheck('student'), subscriptionCheck, enrollCourse);
router.get('/users/enrolled-courses', auth, roleCheck('student'), subscriptionCheck, getEnrolledCourses);
router.get('/users/check-enrollment/:courseId', auth, roleCheck('student'), checkEnrollment);

// ✅ Teacher routes (must be placed BEFORE the :id wildcard)
router.get('/teacher/courses', auth, roleCheck('teacher'), getTeacherCourses);
router.get('/teacher/courses/stats', auth, roleCheck('teacher'), getTeacherCoursesWithStats);
router.get('/teacher/stats-summary', auth, roleCheck('teacher'), getTeacherStatsSummary);
router.put('/teacher/courses/:id/timetable', auth, roleCheck('teacher'), updateCourseTimetable);

module.exports = router;