const Stripe = require('stripe');
const Payment = require('../models/Payment');
const MarketplaceItem = require('../models/MarketplaceItem');
const Sale = require('../models/Sale');
const Artist = require('../models/Artist');
const { createNotification } = require('../services/notificationHelper');
const { sendOrderConfirmation } = require('../services/emailService'); 

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//Create-intent for card payments
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'lkr', description, buyerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount) * 100,
      currency: currency.toLowerCase(),
      description: description || 'FolkFusion marketplace order',
      receipt_email: buyerEmail || undefined,
      metadata: { platform: 'FolkFusion', country: 'LK' },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Stripe createPaymentIntent error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment intent' });
  }
};

// Create-order
exports.createOrder = async (req, res) => {
  try {
    const {
      stripePaymentIntentId,
      method,
      amount,
      buyer,
      items,
      bankReference,
    } = req.body;

    // verify Stripe payment for card method
    if (method === 'card') {
      if (!stripePaymentIntentId) {
        return res.status(400).json({ success: false, message: 'Missing payment intent ID' });
      }
      const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: `Payment not confirmed. Status: ${intent.status}`,
        });
      }
    }

    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();

    const orderItems = (items || []).map((item) => ({
      listingId:    item.listingId,
      listingTitle: item.listingTitle,
      quantity:     item.quantity,
      unitPrice:    item.unitPrice,
      subtotal:     item.quantity * item.unitPrice,
    }));

    // Save to Payment collection
    const payment = await Payment.create({
      stripePaymentIntentId: method === 'card' ? stripePaymentIntentId : undefined,
      orderId,
      buyer,
      method,
      amount,
      currency: 'LKR',
      status:   method === 'card' ? 'succeeded' : 'pending',
      items:    orderItems,
      bankReference: method === 'bank_transfer' ? bankReference : undefined,
      paidAt:   method === 'card' ? new Date() : undefined,
    });

    // payment method mapping 
    const paymentMethodMap = {
      card:          'card',
      cash:          'cash',
      bank_transfer: 'bank-transfer',
    };
    const salePaymentMethod = paymentMethodMap[method] || 'other';

    const io = req.app.get('io');
    let totalShippingCost = 0;

    // save to Sale collection  and notify each artist
    const salePromises = orderItems.map(async (item) => {
      const listing = await MarketplaceItem.findById(item.listingId)
        .select('artist province shipping listingTitle')
        .lean();

      if (!listing || !listing.artist) {
        console.warn(`Listing not found or no artist: ${item.listingId}`);
        return null;
      }

      const shippingCost = listing.shipping?.cost || 0;
      totalShippingCost += shippingCost;

      const sale = await Sale.create({
        marketplaceItem: item.listingId,
        artist:          listing.artist,
        province:        listing.province || 'Western',
        quantity:        item.quantity,
        unitPrice:       item.unitPrice,
        totalAmount:     item.subtotal,
        shippingCost,
        shippingMethod:  'standard',
        paymentMethod:   salePaymentMethod,
        paymentStatus:   method === 'card' ? 'completed' : 'pending',
        orderStatus:     'confirmed',
        orderDate:       new Date(),
        buyer: {
          name:  buyer.name,
          email: buyer.email,
          phone: buyer.phone || '',
          address: {
            street:     buyer.address || '',
            city:       buyer.city || '',
            postalCode: buyer.postalCode || '',
          },
        },
        notes: `Ref: ${orderId}. ${buyer.address || ''}, ${buyer.city || ''} ${buyer.postalCode || ''}`,
      });

      // notify artist
      try {
        const artistDoc = await Artist.findById(listing.artist).populate('user', '_id');
        if (artistDoc?.user?._id) {
          const payLabel = { card: 'Card', cash: 'Cash on Delivery', bank_transfer: 'Bank Transfer' }[method] || method;
          createNotification(io, {
            recipientUserId: artistDoc.user._id.toString(),
            recipientRole:   'artist',
            province:        listing.province,
            type:            'ORDER_PLACED',
            title:           '🛒 New Order Received!',
            message:         `${buyer.name} ordered "${item.listingTitle}" × ${item.quantity} — LKR ${item.subtotal.toLocaleString('en-LK')} via ${payLabel}`,
            data: { listingId: item.listingId, orderId, saleId: sale._id, amount: item.subtotal },
          });
        }
      } catch (notifErr) {
        console.warn('Artist notification failed:', notifErr.message);
      }

      return sale;
    });

    const saleResults = await Promise.all(salePromises);
    const savedSales  = saleResults.filter(Boolean);
    console.log(` ${savedSales.length} Sale record(s) created for order ${orderId}`);

    // update marketplace item stock and revenue counters
    for (const item of orderItems) {
      await MarketplaceItem.findByIdAndUpdate(item.listingId, {
        $inc: {
          'stock.soldQuantity': item.quantity,
          totalSales:           item.quantity,
          totalRevenue:         item.subtotal,
        },
      });
    }

    // send confirmation email to buyer
    try {
      await sendOrderConfirmation({
        orderId,
        buyer,
        items:        orderItems,
        method,
        amount,
        shippingCost: totalShippingCost,
      });
      console.log(`Order confirmation email sent to ${buyer.email}`);
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      paymentId: payment._id,
      status:    payment.status,
    });

  } catch (error) {
    console.error(' createOrder error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to place order' });
  }
};

// webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(' Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          { status: 'succeeded', paidAt: new Date(), $push: { webhookEvents: { event: event.type } } }
        );
        console.log(` Payment succeeded: ${intent.id}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          { status: 'failed', $push: { webhookEvents: { event: event.type } } }
        );
        console.log(`Payment failed: ${intent.id}`);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: charge.payment_intent },
          { status: 'refunded', $push: { webhookEvents: { event: event.type } } }
        );
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  res.status(200).json({ received: true });
};

exports.getMyOrders = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const payments = await Payment.find({ 'buyer.email': email })
      .sort({ createdAt: -1 })
      .select('-stripeClientSecret -webhookEvents');

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin-get all payments 
exports.getAllPayments = async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const total    = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-stripeClientSecret -webhookEvents');

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin-get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const [stats] = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue:   { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] } },
          totalOrders:    { $sum: 1 },
          succeededCount: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] } },
          pendingCount:   { $sum: { $cond: [{ $eq: ['$status', 'pending'] },   1, 0] } },
          failedCount:    { $sum: { $cond: [{ $eq: ['$status', 'failed'] },    1, 0] } },
        },
      },
    ]);

    const byMethod = await Payment.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({ success: true, data: { ...stats, byMethod } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};