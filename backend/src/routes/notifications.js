const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',                    ctrl.getMyNotifications);
router.get('/unread-count',        ctrl.getUnreadCount);
router.patch('/read-all',          ctrl.markAllAsRead);
router.patch('/:id/read',          ctrl.markAsRead);
router.delete('/',                 ctrl.clearAll);
router.delete('/:id',              ctrl.deleteNotification);

module.exports = router;