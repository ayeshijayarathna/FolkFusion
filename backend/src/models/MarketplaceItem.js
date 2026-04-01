const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  artwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
 
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },

  province: {
    type: String,
    required: true,
    enum: ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 
           'North Western', 'North Central', 'Uva', 'Sabaragamuwa']
  },
  

  listingTitle: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  

  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    originalPrice: {
      type: Number
    }
  },
  

  stock: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    soldQuantity: {
      type: Number,
      default: 0
    },
    reserved: {
      type: Number,
      default: 0
    }
  },
  
  shipping: {
    available: {
      type: Boolean,
      default: true
    },
    methods: [{
      type: String,
      enum: ['standard', 'express', 'pickup']
    }],
    cost: {
      type: Number,
      default: 0
    },
    estimatedDays: {
      type: Number
    }
  },
  

  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock', 'suspended'],
    default: 'active'
  },
  
  isApproved: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },

  analytics: {
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    }
  },
  
 
  totalSales: {
    type: Number,
    default: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

marketplaceItemSchema.virtual('availableStock').get(function() {
  return this.stock.quantity - this.stock.soldQuantity - this.stock.reserved;
});


marketplaceItemSchema.methods.isInStock = function() {
  return this.availableStock > 0;
};

marketplaceItemSchema.methods.recordSale = async function(quantity = 1, amount) {
  this.stock.soldQuantity += quantity;
  this.totalSales += quantity;
  this.totalRevenue += amount;
  
  if (this.availableStock === 0) {
    this.status = 'out-of-stock';
  }
  
  await this.save();
};

marketplaceItemSchema.index({ artist: 1, status: 1 });
marketplaceItemSchema.index({ province: 1, status: 1 });
marketplaceItemSchema.index({ createdAt: -1 });
marketplaceItemSchema.index({ totalSales: -1 });

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);

module.exports = MarketplaceItem;