const express = require('express');
const { 
  createAnnouncement, 
  getLatestAnnouncements, 
  deleteAnnouncement 
} = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.post('/', auth, roleCheck('teacher'), createAnnouncement);
router.get('/latest', getLatestAnnouncements);
router.delete('/:id', auth, roleCheck('teacher', 'admin'), deleteAnnouncement);

module.exports = router;