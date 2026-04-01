const express = require('express');
const router  = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect, restrictTo } = require('../middleware/auth');

//public route
router.post('/', inquiryController.createInquiry);

//artist protected routes
router.post('/artist',   protect, restrictTo('artist'), inquiryController.createArtistInquiry);
router.get('/my',        protect, restrictTo('artist'), inquiryController.getMyInquiries);
router.put('/my/:id',    protect, restrictTo('artist'), inquiryController.updateMyInquiry);
router.delete('/my/:id', protect, restrictTo('artist'), inquiryController.deleteMyInquiry);

// admin only protected routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/province',       inquiryController.getProvinceInquiries);
router.get('/province/stats', inquiryController.getProvinceStats);

router.post('/:id/reply', inquiryController.replyToInquiry);
router.put('/:id',        inquiryController.updateInquiry);
router.delete('/:id',     inquiryController.deleteInquiry);

module.exports = router;