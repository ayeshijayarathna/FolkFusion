const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
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
  bio: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  profileImage: {
    url: String,
    publicId: String
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street:     { type: String, default: '' },
    city:       { type: String, default: '' },
    district:   { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  specialization: [{
    type: String,
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
  }],
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0
  },
  certification: {
    hasCertification:     { type: Boolean, default: false },
    certificationDetails: String
  },
  socialMedia: {
    facebook:  String,
    instagram: String,
    twitter:   String,
    website:   String
  },
  statistics: {
    totalArtworks: { type: Number, default: 0 },
    totalViews:    { type: Number, default: 0 },
    totalSales:    { type: Number, default: 0 }
  },

  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date,
    default: null
  },
  featuredRank: {
    type: Number,  
    default: null
  }

}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

artistSchema.virtual('artworks', {
  ref:         'Artwork',
  localField:  '_id',
  foreignField:'artist'
});

artistSchema.index({ specialization: 1 });
artistSchema.index({ isFeatured: 1 });   

module.exports = mongoose.model('Artist', artistSchema);