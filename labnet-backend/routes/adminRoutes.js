const express = require('express');
const {
  getStats,
  getAllUsers,
  updateUser,
  blockUser,
  unblockUser,
  activateSubscriptionManually,
  expireSubscription,
  deleteUser,
  getAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachers,
  getAnalytics,
  getTeachersList,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.use(auth, roleCheck('admin'));

// Dashboard stats
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);
router.post('/users/:id/activate-subscription', activateSubscriptionManually);
router.post('/users/:id/expire-subscription', expireSubscription);
router.delete('/users/:id', deleteUser);

// Course management
router.get('/courses', getAllCoursesAdmin);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Teacher list (for course assignment)
router.get('/teachers', getTeachers);

// Teacher management (new)
router.get('/teachers-list', getTeachersList);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;