const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', donationController.createDonation);
router.put('/:id/payment-status', donationController.updatePaymentStatus);


router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', donationController.getStats);

router.get('/', donationController.getAll);

router.put('/:id/acknowledge', donationController.acknowledgeDonation);

router.get('/:id', donationController.getDonation);

module.exports = router;