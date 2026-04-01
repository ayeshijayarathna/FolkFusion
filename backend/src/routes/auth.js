const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/login', authController.login);

router.use(protect);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/change-password', authController.changePassword);
router.post('/register-artist', restrictTo('admin'), authController.registerArtist);
router.post('/register-admin', restrictTo('admin'), authController.registerAdmin);

module.exports = router;