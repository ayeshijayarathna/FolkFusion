const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true, 
  },
  stripeClientSecret: {
    type: String,
    select: false, 
  },

  marketplaceItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
  },
  orderId: {
    type: String, 
    required: true,
    unique: true,
  },

  buyer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String },
    address: { type: String },
    city:    { type: String },
    postalCode: { type: String },
  },

  method: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'LKR',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
  },

  items: [
    {
      listingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceItem' },
      listingTitle: String,
      quantity:     Number,
      unitPrice:    Number,
      subtotal:     Number,
    },
  ],

  bankReference: { type: String },

  webhookEvents: [
    {
      event: String,
      receivedAt: { type: Date, default: Date.now },
    },
  ],

  paidAt: { type: Date },
}, {
  timestamps: true,
});

paymentSchema.index({ 'buyer.email': 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);