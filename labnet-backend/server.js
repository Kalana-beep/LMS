require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const allowedOrigins = ['https://lms-fawn-mu.vercel.app', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error('CORS')); },
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.get('/', (req, res) => res.send('LabNet API'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));