const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    required: false,  
    default: '',     
    trim: true
  },
  whatsappNumber: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    street: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    district: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

adminSchema.virtual('userData', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Admin', adminSchema);