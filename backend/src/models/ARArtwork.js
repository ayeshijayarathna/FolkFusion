const mongoose = require('mongoose');

const arArtworkSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    category:    { type: String, default: '' },
    image:       { type: String, default: '' }, 
    glbModel:    { type: String, default: '' },   
    isPublished: { type: Boolean, default: false },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ARArtwork', arArtworkSchema);