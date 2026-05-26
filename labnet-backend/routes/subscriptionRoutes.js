const express = require('express');
const { activateSubscription } = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/activate', auth, activateSubscription);

module.exports = router;