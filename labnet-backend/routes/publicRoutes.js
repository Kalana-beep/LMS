const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Public route to get all public teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher', 
      isVerified: true, 
      isPublic: true 
    })
      .select('name bio specialization profileImage phone')
      .sort({ createdAt: -1 });
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;