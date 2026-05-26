const express = require('express');
const { uploadVideo, getVideo, deleteVideo } = require('../controllers/videoController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.post('/upload', auth, roleCheck('teacher'), uploadVideo);
router.get('/:id', auth, getVideo);
router.delete('/:id', auth, roleCheck('teacher', 'admin'), deleteVideo);

module.exports = router;