require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));  // ✅ Added
app.use('/api/upcoming-lessons', require('./routes/upcomingLessonRoutes'));

// Root endpoint
app.get('/', (req, res) => res.send('Sigma API Running'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));