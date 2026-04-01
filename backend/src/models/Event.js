const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  eventType: {
    type: String,
    enum: ['Workshop', 'Exhibition', 'Festival', 'Competition', 'Training', 'Other'],
    required: true
  },
  province: {
    type: String,
    required: true
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  coverImage: {
    url: String,
    publicId: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  categories: [{
    type: String
  }],
  capacity: {
    type: Number,
    default: 0 
  },
  registrationDeadline: Date,
  participants: [{
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  contactInfo: {
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

eventSchema.index({ province: 1, startDate: 1 });
eventSchema.index({ status: 1 });

eventSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'ongoing';
  } else {
    this.status = 'completed';
  }
};

module.exports = mongoose.model('Event', eventSchema);