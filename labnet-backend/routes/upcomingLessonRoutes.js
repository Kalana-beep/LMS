const express = require('express');
const {
  createLesson,
  getCourseLessons,
  updateLesson,
  deleteLesson
} = require('../controllers/upcomingLessonController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Teacher routes
router.post('/', auth, roleCheck('teacher'), createLesson);
router.put('/:id', auth, roleCheck('teacher'), updateLesson);
router.delete('/:id', auth, roleCheck('teacher'), deleteLesson);

// Anyone authenticated (student, teacher, admin) can view
router.get('/course/:courseId', auth, getCourseLessons);

module.exports = router;