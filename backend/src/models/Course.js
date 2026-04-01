const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  province: {
    type: String,
    required: [true, 'Province is required'],
    enum: [
      'Western', 'Central', 'Southern', 'Northern', 'Eastern',
      'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ]
  },

  historicalPlace: {
    name: {
      type: String,
      required: [true, 'Historical place name is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  artForm: {
    type: String,
    required: [true, 'Art form is required'],
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

  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  },

  duration: {
    weeks: {
      type: Number,
      required: [true, 'Duration in weeks is required']
    },
    hoursPerWeek: {
      type: Number,
      required: [true, 'Hours per week is required']
    }
  },

  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: {
      start: String, 
      end: String    
    }
  },

  capacity: {
    minimum: {
      type: Number,
      default: 5
    },
    maximum: {
      type: Number,
      required: [true, 'Maximum capacity is required']
    }
  },

  enrolledStudents: {
    type: Number,
    default: 0
  },

  fee: {
    amount: {
      type: Number,
      required: [true, 'Course fee is required'],
      min: [0, 'Fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    paymentSchedule: {
      type: String,
      enum: ['One-time', 'Weekly', 'Monthly'],
      default: 'One-time'
    }
  },

  instructor: {
    name: {
      type: String,
      required: [true, 'Instructor name is required']
    },
    bio: String,
    photo: String,
    qualifications: [String],
    experience: String 
  },


  syllabus: [{
    week: Number,
    topic: String,
    description: String
  }],

  prerequisites: [String],
  
  materials: [{
    item: String,
    providedByInstitute: {
      type: Boolean,
      default: false
    }
  }],

  images: [{
    type: String
  }],

  videos: [{
    url: String,
    title: String
  }],

  status: {
    type: String,
    enum: ['draft', 'active', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },

  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },

  endDate: Date,

  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },

  certification: {
    provided: {
      type: Boolean,
      default: false
    },
    details: String
  },

  languageOfInstruction: {
    type: String,
    default: 'Sinhala',
    enum: ['Sinhala', 'Tamil', 'English', 'Bilingual', 'Multilingual']
  },

  contactPerson: {
    name: String,
    phone: String,
    email: String,
    whatsapp: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },

  views: {
    type: Number,
    default: 0
  },

  inquiries: {
    type: Number,
    default: 0
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  tags: [String]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseSchema.index({ province: 1, status: 1 });
courseSchema.index({ artForm: 1 });
courseSchema.index({ startDate: 1 });
courseSchema.index({ 'historicalPlace.name': 'text', title: 'text', description: 'text' });

courseSchema.virtual('availableSpots').get(function() {
  return this.capacity.maximum - this.enrolledStudents;
});


courseSchema.virtual('isFull').get(function() {
  return this.enrolledStudents >= this.capacity.maximum;
});


courseSchema.virtual('registrationOpen').get(function() {
  const now = new Date();
  return now < this.registrationDeadline && !this.isFull && this.status === 'active';
});


courseSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};


courseSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};


courseSchema.methods.enrollStudent = function() {
  if (this.isFull) {
    throw new Error('Course is full');
  }
  this.enrolledStudents += 1;
  if (this.enrolledStudents >= this.capacity.maximum) {
    this.status = 'full';
  }
  return this.save();
};

courseSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'active' || this.status === 'upcoming') {
    if (this.startDate <= now && (!this.endDate || this.endDate >= now)) {
      this.status = 'ongoing';
    } else if (this.endDate && this.endDate < now) {
      this.status = 'completed';
    }
  }
  
  next();
});

module.exports = mongoose.model('Course', courseSchema);