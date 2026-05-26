const express = require('express');
const { 
  getTeacherCourses, 
  getTeacherCoursesWithStats, 
  getTeacherStatsSummary, 
  updateCourseTimetable,
  updateTeacherCourse
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.use(auth, roleCheck('teacher'));

router.get('/courses', getTeacherCourses);
router.get('/courses/stats', getTeacherCoursesWithStats);
router.get('/stats-summary', getTeacherStatsSummary);
router.put('/courses/:id/timetable', updateCourseTimetable);
router.put('/courses/:id', updateTeacherCourse);

module.exports = router;