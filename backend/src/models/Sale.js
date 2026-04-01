const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  
  marketplaceItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  
  province: {
    type: String,
    required: true
  },
 
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
  unitPrice: {
    type: Number,
    required: true
  },
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  shippingCost: {
    type: Number,
    default: 0
  },
  
  buyer: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String
    }
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank-transfer', 'other'], 
    default: 'cash'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  transactionId: {
    type: String
  },
  
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'pickup']
  },
  
  trackingNumber: {
    type: String
  },
  
  orderDate: {
    type: Date,
    default: Date.now
  },
  
  shippedDate: {
    type: Date
  },
  
  deliveredDate: {
    type: Date
  },

  notes: {
    type: String
  },

  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

saleSchema.index({ artist: 1, createdAt: -1 });
saleSchema.index({ province: 1, createdAt: -1 });
saleSchema.index({ orderDate: -1 });
saleSchema.index({ paymentStatus: 1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;