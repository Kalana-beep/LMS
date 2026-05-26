const express = require('express');
const { register, verifyOTP, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;