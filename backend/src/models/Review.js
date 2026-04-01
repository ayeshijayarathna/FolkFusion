const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userName:  { type: String, required: true },
    email:     { type: String, required: true },
    category:  { type: String, default: '' },
    rating:    { type: Number, min: 1, max: 5, required: true },
    comment:   { type: String, required: true },
    status:    {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);