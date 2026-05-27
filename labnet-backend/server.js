require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// CORS – allow Vercel frontend
const allowedOrigins = [
  'https://lms-fawn-mu.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

app.get('/', (req, res) => res.send('LabNet API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));