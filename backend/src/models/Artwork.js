const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Artwork title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
        'Batik Clothing',
        'Handloom Saree',
        'Folk Jewelry',
        'Ceramic',
        'Statues',
        'Sri Lankan Sculpture',
        'Wood Carving',
        'Cane Work',
        'Mats',
        'Hana Fiber Crafts',
        'Coconut Crafts',
        'Metal Craft',
        'Lacquer Work',
        'Folk Mural Painting',
        'Puppetry',
        'Drum Craft',
        'Rabana Making',
        'Traditional Masks',
        'Beeralu Lace',
        'Sesath Craft',
        'Palm Leaf Craft',
        'Ola Leaf Manuscripts',
        'Calabash Art',
        'Traditional Toy Making',
        'Horn Craft',
        'Pottery & Clay',
        'Other'
    ]
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  province: {
    type: String,
    required: true
  },
  dimensions: {
    height: Number,
    width: Number,
    depth: Number,
    unit: {
      type: String,
      enum: ['cm', 'inches', 'feet'],
      default: 'cm'
    }
  },
  materials: [String],
  creationYear: Number,
  isForSale: {
    type: Boolean,
    default: false
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'not-for-sale'],
    default: 'available'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: true 
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });
artworkSchema.index({ province: 1, category: 1 });
artworkSchema.index({ artist: 1 });

module.exports = mongoose.model('Artwork', artworkSchema);