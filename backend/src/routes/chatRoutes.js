const express = require('express');
const router  = express.Router();
const { chat, getSession } = require('../controllers/chatController');

// Public 
router.post('/', chat);

// Optional: check session info (for debugging)
router.get('/session/:sessionId', getSession);

module.exports = router;