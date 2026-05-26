const VideoQuestion = require('../models/VideoQuestion');
const Video = require('../models/Video');
const Course = require('../models/Course');
const User = require('../models/User');

// Student asks a question
exports.askQuestion = async (req, res) => {
  try {
    const { videoId, question } = req.body;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'User not found' });
    
    const newQuestion = await VideoQuestion.create({
      videoId,
      studentId: req.user.id,
      studentName: student.name,
      question
    });
    res.status(201).json({ question: newQuestion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get questions for a specific video (for student to see answers)
exports.getQuestionsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const questions = await VideoQuestion.find({ videoId, studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher gets all questions for their videos
exports.getTeacherQuestions = async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherEmail });
    const courseIds = courses.map(c => c._id);
    const videos = await Video.find({ courseId: { $in: courseIds } });
    const videoIds = videos.map(v => v._id);
    const questions = await VideoQuestion.find({ videoId: { $in: videoIds } })
      .populate('videoId', 'title')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher answers a question
exports.answerQuestion = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const question = await VideoQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    // Verify teacher owns the video
    const video = await Video.findById(question.videoId);
    const course = await Course.findById(video.courseId);
    if (course.teacherEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to answer this question' });
    }
    
    question.answer = answer;
    question.answeredAt = new Date();
    await question.save();
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};