const express = require('express');
const { askQuestion, getQuestionsByVideo, getTeacherQuestions, answerQuestion } = require('../controllers/questionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Student routes
router.post('/ask', auth, roleCheck('student'), askQuestion);
router.get('/video/:videoId', auth, roleCheck('student'), getQuestionsByVideo);

// Teacher routes
router.get('/teacher/questions', auth, roleCheck('teacher'), getTeacherQuestions);
router.post('/teacher/answer', auth, roleCheck('teacher'), answerQuestion);

module.exports = router;