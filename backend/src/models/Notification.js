const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // role of the recipient
    recipientRole: {
      type: String,
      enum: ['admin', 'artist'],
      required: true,
    },

    // province — used to route admin notifications to the correct province admin
    province: {
      type: String,
      required: true,
    },

    // notification category 
    type: {
      type: String,
      enum: [
        // admin side
        'ARTWORK_ADDED',          
        'ARTWORK_LIKES_MILESTONE', 
        'MARKETPLACE_SALE',     
        'MARKETPLACE_ITEM_ADDED', 
        'DONATION_RECEIVED',      
        'INQUIRY_RECEIVED',       

        // artist side 
        'ARTWORK_LIKED',          
        'ARTWORK_VIEWS_MILESTONE', 
        'EVENT_ADDED',           
        'ORDER_PLACED',           
        'ARTIST_FEATURED',        
        'COURSE_PUBLISHED',       
        'INQUIRY_REPLIED',        
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      artworkId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
      artistId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
      itemId:      { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceItem' },
      saleId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
      donationId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
      inquiryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
      eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
      courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      likeCount:   Number,
      viewCount:   Number,
      amount:      Number,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for fast queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ province: 1, recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);