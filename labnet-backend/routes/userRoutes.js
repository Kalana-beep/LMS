const express = require('express');
const { getEnrolledCourses, checkEnrollment } = require('../controllers/courseController');
const { updateProfileImage, removeProfileImage, getProfile } = require('../controllers/userController');
const { uploadProfile } = require('../config/multer');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const subscriptionCheck = require('../middleware/subscriptionCheck');
const router = express.Router();

router.get('/enrolled-courses', auth, roleCheck('student'), subscriptionCheck, getEnrolledCourses);
router.get('/check-enrollment/:courseId', auth, roleCheck('student'), checkEnrollment);
router.put('/profile-image', auth, uploadProfile.single('profileImage'), updateProfileImage);
router.delete('/profile-image', auth, removeProfileImage);
router.get('/profile', auth, getProfile);

module.exports = router;