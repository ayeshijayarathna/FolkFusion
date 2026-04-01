const mongoose = require('mongoose');

const historicalPlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    enum: ['Central', 'Eastern', 'Northern', 'Southern', 'Western', 'North Central', 'North Western', 'Sabaragamuwa', 'Uva']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  artType: {
    type: String,
    required: [true, 'Art type is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  culturalImportance: {
    type: String,
    required: [true, 'Cultural importance is required']
  },
  history: {
    type: String,
    required: [true, 'History is required']
  },
  images: [{
    type: String
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  nearbyAttractions: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

historicalPlaceSchema.index({
  name: 'text',
  location: 'text',
  district: 'text',
  city: 'text',
  description: 'text'
});

const HistoricalPlace = mongoose.model('HistoricalPlace', historicalPlaceSchema);

module.exports = HistoricalPlace;