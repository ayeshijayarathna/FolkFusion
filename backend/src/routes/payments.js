const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createOrder,
  handleWebhook,
  getMyOrders,
  getAllPayments,
  getPaymentStats,
} = require('../controllers/paymentController');

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// public routes 

router.post('/create-intent', createPaymentIntent);
router.post('/create-order', createOrder);
router.get('/my-orders', getMyOrders);

// admin routes 
router.get('/admin/all',   getAllPayments);
router.get('/admin/stats', getPaymentStats);

module.exports = router;
