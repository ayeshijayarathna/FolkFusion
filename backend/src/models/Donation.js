const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({

  donor: {
    fullName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Sri Lanka'
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },

  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [100, 'Minimum donation is LKR 100']
  },
  currency: {
    type: String,
    default: 'LKR'
  },

  purpose: {
    type: String,
    enum: ['general', 'artist-support', 'event-sponsorship', 'preservation', 'education'],
    default: 'general'
  },

  targetArtist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  targetEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },

  allocatedProvince: {
    type: String,
    enum: [
      'Western',
      'Central',
      'Southern',
      'Northern',
      'Eastern',
      'North Western',
      'North Central',
      'Uva',
      'Sabaragamuwa',
      'All Provinces'
    ],
    default: 'All Provinces'
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'bank-transfer', 'mobile-payment'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true   
  },
  paymentGateway: {
    type: String,
    default: 'Stripe'
  },
  paymentDetails: {
    orderId: String,
    paymentId: String,
    statusCode: String,
    statusMessage: String
  },
  paidAt: Date,

  message: {
    type: String,
    maxlength: 500
  },

  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptSent: {
    type: Boolean,
    default: false
  },

  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  notes: String

}, {
  timestamps: true
});

// generate receipt number only when payment is completed
donationSchema.pre('save', async function (next) {
  if (!this.receiptNumber && this.paymentStatus === 'completed') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Donation').countDocuments();
    this.receiptNumber = `DON-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

donationSchema.index({ paymentStatus: 1, createdAt: -1 });
donationSchema.index({ allocatedProvince: 1 });
donationSchema.index({ 'donor.email': 1 });

module.exports = mongoose.model('Donation', donationSchema);