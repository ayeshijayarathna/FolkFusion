const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, restrictTo, checkArtistApproval } = require('../middleware/auth');
const { uploadEvent } = require('../config/cloudinary');

router.get('/', eventController.getEvents);

router.get('/stats', protect, restrictTo('admin'), eventController.getEventStats);
router.get('/admin/province-events', protect, restrictTo('admin'), eventController.getProvinceEvents);

router.get('/me/registered', protect, restrictTo('artist'), eventController.getMyEvents);

router.post(
  '/:id/register',
  protect,
  restrictTo('artist'),
  checkArtistApproval,
  eventController.registerForEvent
);

router.delete(
  '/:id/register',
  protect,
  restrictTo('artist'),
  eventController.cancelRegistration
);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  uploadEvent.single('coverImage'),
  eventController.createEvent
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  eventController.updateEvent
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  eventController.deleteEvent
);

router.get('/:id', eventController.getEvent);

module.exports = router;