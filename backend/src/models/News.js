const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Training Program',
      'Exhibition',
      'Achievement',
      'Technology',
      'Workshop',
      'Festival',
      'Announcement',
      'Other'
    ]
  },
  images: [{
    type: String,
    required: true
  }],
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    required: [true, 'Please provide a province'],
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
    ]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

newsSchema.index({ category: 1, province: 1, isPublished: 1 });
newsSchema.index({ date: -1 });
newsSchema.index({ isFeatured: 1 });


newsSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

newsSchema.set('toJSON', { virtuals: true });
newsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('News', newsSchema);