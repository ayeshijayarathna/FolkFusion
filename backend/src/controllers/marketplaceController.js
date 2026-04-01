const MarketplaceItem = require('../models/MarketplaceItem');
const Sale            = require('../models/Sale');
const Artist          = require('../models/Artist');
const Artwork         = require('../models/Artwork');
const User            = require('../models/User');
const { createNotification } = require('../services/notificationHelper');
const { sendOrderStatusUpdate } = require('../services/emailService');

// helper functions 
async function getProvinceAdminUser(province) {
  return User.findOne({ role: 'admin', province });
}

async function getArtistUserFromArtistId(artistId) {
  return Artist.findById(artistId).populate('user');
}

// Public-get all marketplace items 
exports.getMarketplaceItems = async (req, res) => {
  try {
    const { province, category, minPrice, maxPrice, search, status = 'active', page = 1, limit = 12, sort = '-createdAt' } = req.query;
    let query = { status, isApproved: true };
    if (province && province !== 'all') query.province = province;
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }
    if (search) query.$or = [{ listingTitle: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    const items = await MarketplaceItem.find(query)
      .populate('artist', 'fullName province profileImage')
      .populate('artwork', 'title category images')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await MarketplaceItem.countDocuments(query);
    res.status(200).json({ success: true, count: items.length, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Items fetching error', error: error.message });
  }
};

// public-get single marketplace item 
exports.getMarketplaceItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('artist', 'fullName province profileImage phone socialMedia')
      .populate('artwork', 'title description category images dimensions materials');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.analytics.views += 1;
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Item fetching error', error: error.message });
  }
};

// artist- Create marketplace listing 
exports.createListing = async (req, res) => {
  try {
    const { artworkId, listingTitle, description, price, stock, shipping } = req.body;
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist profile not found' });

    const artwork = await Artwork.findOne({ _id: artworkId, artist: artist._id });
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found or you do not own it' });

    const existing = await MarketplaceItem.findOne({ artwork: artworkId, status: 'active' });
    if (existing) return res.status(400).json({ success: false, message: 'This artwork is already listed in marketplace' });

    const item = await MarketplaceItem.create({
      artwork: artworkId, artist: artist._id, province: req.user.province,
      listingTitle, description, price, stock, shipping, status: 'active',
    });
    const populatedItem = await MarketplaceItem.findById(item._id)
      .populate('artist', 'fullName province')
      .populate('artwork', 'title images');

    const io        = req.app.get('io');
    const adminUser = await getProvinceAdminUser(req.user.province);
    if (adminUser) {
      createNotification(io, {
        recipientUserId: adminUser._id.toString(),
        recipientRole:   'admin',
        province:        req.user.province,
        type:            'MARKETPLACE_ITEM_ADDED',
        title:           'New Marketplace Listing',
        message:         `${artist.fullName} listed "${listingTitle}" on the marketplace.`,
        data: { itemId: item._id, artistId: artist._id },
      });
    }

    res.status(201).json({ success: true, message: 'Marketplace listing created successfully', data: populatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Listing creation error', error: error.message });
  }
};

// artist- Update listing 
exports.updateListing = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    const artist = await Artist.findOne({ user: req.user._id });
    if (item.artist.toString() !== artist._id.toString())
      return res.status(403).json({ success: false, message: 'You do not have permission to update this item' });
    const allowedUpdates = ['listingTitle', 'description', 'price', 'stock', 'shipping', 'status'];
    allowedUpdates.forEach(field => { if (req.body[field] !== undefined) item[field] = req.body[field]; });
    await item.save();
    res.status(200).json({ success: true, message: 'Listing updated successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Listing update error', error: error.message });
  }
};

// artist-delete listing
exports.deleteListing = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    const artist = await Artist.findOne({ user: req.user._id });
    if (item.artist.toString() !== artist._id.toString())
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this item' });
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Listing deletion error', error: error.message });
  }
};

//artist-get my listings 
exports.getMyListings = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    const { page = 1, limit = 12, status } = req.query;
    let query = { artist: artist._id };
    if (status) query.status = status;
    const items = await MarketplaceItem.find(query)
      .populate('artwork', 'title images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await MarketplaceItem.countDocuments(query);
    res.status(200).json({ success: true, count: items.length, total: count, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving listings', error: error.message });
  }
};

//artist- Get my sales (used by OrderManagement dashboard)
exports.getMySales = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    const { startDate, endDate, period = 'all' } = req.query;

    let dateQuery = { artist: artist._id };

    if (startDate && endDate) {
      dateQuery.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period !== 'all') {
      const periodMap = { today: 0, week: 7, month: 30, year: 365 };
      if (periodMap[period] !== undefined) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - periodMap[period]);
        dateQuery.orderDate = { $gte: daysAgo };
      }
    }

    // all sales of all payment statuses 
    const sales = await Sale.find(dateQuery)
      .populate({
        path: 'marketplaceItem',
        select: 'listingTitle artwork',
        populate: { path: 'artwork', select: 'title category images' },
      })
      .sort('-orderDate');

    // revenue & quantity stats completed payments only 
    const completedSales  = sales.filter(s => s.paymentStatus === 'completed');
    const totalRevenue    = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalQuantity   = completedSales.reduce((sum, s) => sum + s.quantity, 0);

    // charts use completed only
    const completedQuery = { ...dateQuery, paymentStatus: 'completed' };

    const salesByMonth = await Sale.aggregate([
      { $match: completedQuery },
      {
        $group: {
          _id:      { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
          count:    { $sum: 1 },
          revenue:  { $sum: '$totalAmount' },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const topItems = await Sale.aggregate([
      { $match: completedQuery },
      {
        $group: {
          _id:           '$marketplaceItem',
          totalSales:    { $sum: 1 },
          totalRevenue:  { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);
    await MarketplaceItem.populate(topItems, { path: '_id', select: 'listingTitle price' });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSales:        sales.length,           
          totalRevenue,                               
          totalQuantity,                              
          averageOrderValue: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
          pendingCount:      sales.filter(s => s.paymentStatus === 'pending' && s.paymentMethod !== 'card').length,
        },
        salesByMonth,
        topItems,
        recentSales: sales,  
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving sales data', error: error.message });
  }
};

// artist-get my orders (used by OrderManagement dashboard)
exports.getMyOrders = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });

    const { status, paymentStatus, page = 1, limit = 50, period = 'all' } = req.query;

    let query = { artist: artist._id };
    if (status)        query.orderStatus   = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (period && period !== 'all') {
      const periodMap = { today: 0, week: 7, month: 30, year: 365 };
      if (periodMap[period] !== undefined) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - periodMap[period]);
        query.orderDate = { $gte: daysAgo };
      }
    }

    const orders = await Sale.find(query)
      .populate({
        path: 'marketplaceItem',
        select: 'listingTitle price artwork',
        populate: { path: 'artwork', select: 'title category images' },
      })
      .sort('-orderDate')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Sale.countDocuments(query);

    // Count pending non-card payments (needs artist action)
    const pendingCount = await Sale.countDocuments({
      artist:        artist._id,
      paymentStatus: 'pending',
      paymentMethod: { $in: ['cash', 'bank_transfer', 'bank-transfer'] },
    });

    res.json({
      success: true,
      data:       orders,
      total,
      pendingCount,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// artist-update order tracking status 
exports.updateOrderStatus = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    const sale   = await Sale.findById(req.params.saleId)
      .populate('marketplaceItem', 'listingTitle');

    if (!sale) return res.status(404).json({ success: false, message: 'Order not found' });
    if (sale.artist.toString() !== artist._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { orderStatus, trackingNumber, shippingCarrier, trackingNote } = req.body;

    if (orderStatus)     sale.orderStatus    = orderStatus;
    if (trackingNumber)  sale.trackingNumber = trackingNumber;
    if (shippingCarrier) sale.shippingCarrier = shippingCarrier;

    if (trackingNote) {
      if (!sale.trackingHistory) sale.trackingHistory = [];
      sale.trackingHistory.push({
        status: orderStatus || sale.orderStatus,
        note:   trackingNote,
        date:   new Date(),
      });
    }

    if (orderStatus === 'shipped'   && !sale.shippedDate)   sale.shippedDate   = new Date();
    if (orderStatus === 'delivered' && !sale.deliveredDate) sale.deliveredDate = new Date();

    await sale.save();

    // send status update email to buyer
    try {
      await sendOrderStatusUpdate({
        sale,
        orderStatus:     orderStatus     || sale.orderStatus,
        trackingNumber:  trackingNumber  || sale.trackingNumber,
        shippingCarrier: shippingCarrier || sale.shippingCarrier,
        trackingNote,
      });
    } catch (emailErr) {
      console.warn('⚠️  Status update email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'Order updated successfully', data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// artist manually confirm payment received (cash & bank transfer)
exports.confirmPayment = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    const sale   = await Sale.findById(req.params.saleId);

    if (!sale) return res.status(404).json({ success: false, message: 'Order not found' });
    if (sale.artist.toString() !== artist._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (sale.paymentMethod === 'card')
      return res.status(400).json({ success: false, message: 'Card payments are confirmed automatically via Stripe' });

    sale.paymentStatus = 'completed';
    if (sale.orderStatus === 'pending') sale.orderStatus = 'confirmed';

    // update marketplace item revenue (was skipped for non-card orders)
    const item = await MarketplaceItem.findById(sale.marketplaceItem);
    if (item) {
      item.totalRevenue = (item.totalRevenue || 0) + sale.totalAmount;
      await item.save();
    }

    await sale.save();
    res.json({ success: true, message: 'Payment confirmed successfully', data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// public-track order by reference number
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    let sale = null;

    if (orderId.length === 24) {
      sale = await Sale.findById(orderId)
        .populate({ path: 'marketplaceItem', select: 'listingTitle price artwork', populate: { path: 'artwork', select: 'title category images' } })
        .populate('artist', 'fullName province');
    }

    // fallback -match by trailing 8-char reference (shown to user)
    if (!sale) {
      const recent = await Sale.find({})
        .populate({ path: 'marketplaceItem', select: 'listingTitle price artwork', populate: { path: 'artwork', select: 'title category images' } })
        .populate('artist', 'fullName province')
        .sort('-orderDate')
        .limit(1000);

      sale = recent.find(s =>
        s._id.toString().slice(-8).toUpperCase() === orderId.toUpperCase()
      );
    }

    if (!sale)
      return res.status(404).json({ success: false, message: 'Order not found. Please check your reference number.' });

    // return safe public subset (no full buyer address)
    res.json({
      success: true,
      data: {
        _id:             sale._id,
        refNum:          sale._id.toString().slice(-8).toUpperCase(),
        orderStatus:     sale.orderStatus,
        paymentStatus:   sale.paymentStatus,
        paymentMethod:   sale.paymentMethod,
        quantity:        sale.quantity,
        totalAmount:     sale.totalAmount,
        orderDate:       sale.orderDate,
        shippedDate:     sale.shippedDate,
        deliveredDate:   sale.deliveredDate,
        trackingNumber:  sale.trackingNumber,
        shippingCarrier: sale.shippingCarrier,
        trackingHistory: sale.trackingHistory || [],
        shippingMethod:  sale.shippingMethod,
        item: {
          title:    sale.marketplaceItem?.listingTitle,
          category: sale.marketplaceItem?.artwork?.category,
          image:    sale.marketplaceItem?.artwork?.images?.[0],
        },
        artist: {
          name:     sale.artist?.fullName,
          province: sale.artist?.province,
        },
        buyer: { name: sale.buyer?.name },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//artist -record a manual sale
exports.recordSale = async (req, res) => {
  try {
    const { quantity = 1, buyer, paymentMethod, shippingMethod, notes } = req.body;
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.availableStock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const totalAmount = item.price.amount * quantity + (item.shipping.cost || 0);
    const sale = await Sale.create({
      marketplaceItem: item._id,
      artist:          item.artist,
      province:        item.province,
      quantity,
      unitPrice:       item.price.amount,
      totalAmount,
      shippingCost:    item.shipping.cost || 0,
      buyer,
      paymentMethod,
      paymentStatus:   'completed',
      orderStatus:     'confirmed',
      shippingMethod,
      notes,
      recordedBy:      req.user._id,
    });

    await item.recordSale(quantity, totalAmount);

    const io = req.app.get('io');

    const adminUser = await getProvinceAdminUser(item.province);
    if (adminUser) {
      createNotification(io, {
        recipientUserId: adminUser._id.toString(),
        recipientRole:   'admin',
        province:        item.province,
        type:            'MARKETPLACE_SALE',
        title:           'Marketplace Sale!',
        message:         `A sale of LKR ${totalAmount.toLocaleString()} was recorded for "${item.listingTitle}".`,
        data: { itemId: item._id, saleId: sale._id, amount: totalAmount },
      });
    }

    const artistDoc = await getArtistUserFromArtistId(item.artist);
    if (artistDoc?.user) {
      createNotification(io, {
        recipientUserId: artistDoc.user._id.toString(),
        recipientRole:   'artist',
        province:        item.province,
        type:            'ORDER_PLACED',
        title:           'New Order Received!',
        message:         `Someone ordered "${item.listingTitle}" (Qty: ${quantity}). Revenue: LKR ${totalAmount.toLocaleString()}`,
        data: { itemId: item._id, saleId: sale._id, amount: totalAmount },
      });
    }

    res.status(201).json({ success: true, message: 'Sale recorded successfully', data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error recording sale', error: error.message });
  }
};

// admin get province items
exports.getProvinceItems = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = { province: req.user.province };
    if (status && status !== 'all') {
      if (status === 'active') { query.status = 'active'; query.availableStock = { $gt: 0 }; }
      else if (status === 'out-of-stock') { query.$or = [{ status: 'out-of-stock' }, { availableStock: { $lte: 0 } }]; }
      else query.status = status;
    }
    const items = await MarketplaceItem.find(query)
      .populate('artist', 'fullName')
      .populate('artwork', 'title images category')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await MarketplaceItem.countDocuments(query);
    const stats = {
      total:      await MarketplaceItem.countDocuments({ province: req.user.province }),
      active:     await MarketplaceItem.countDocuments({ province: req.user.province, status: 'active', availableStock: { $gt: 0 } }),
      outOfStock: await MarketplaceItem.countDocuments({ province: req.user.province, $or: [{ status: 'out-of-stock' }, { availableStock: { $lte: 0 } }] }),
    };
    res.status(200).json({ success: true, count: items.length, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), stats, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving province items', error: error.message });
  }
};

// admin-get province sales stats 
exports.getProvinceSalesStats = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    let dateQuery = { province: req.user.province };
    if (startDate && endDate) {
      dateQuery.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period && period !== 'all') {
      const periodMap = { today: 0, week: 7, month: 30, year: 365 };
      if (periodMap[period] !== undefined) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - periodMap[period]);
        dateQuery.orderDate = { $gte: daysAgo };
      }
    }
    const completedQuery = { ...dateQuery, paymentStatus: 'completed' };
    const completedSales = await Sale.find(completedQuery);
    const totalSales     = completedSales.length;
    const totalRevenue   = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalQuantity  = completedSales.reduce((sum, s) => sum + s.quantity, 0);
    const salesByPeriod  = await Sale.aggregate([
      { $match: completedQuery },
      { $group: { _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' }, quantity: { $sum: '$quantity' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const topArtists = await Sale.aggregate([
      { $match: completedQuery },
      { $group: { _id: '$artist', totalSales: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);
    await Artist.populate(topArtists, { path: '_id', select: 'fullName profileImage' });
    const topItems = await Sale.aggregate([
      { $match: completedQuery },
      { $group: { _id: '$marketplaceItem', totalSales: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);
    await MarketplaceItem.populate(topItems, { path: '_id', select: 'listingTitle price', populate: { path: 'artist', select: 'fullName' } });
    const allSales = await Sale.find(dateQuery)
      .populate({ path: 'marketplaceItem', select: 'listingTitle price', populate: { path: 'artwork', select: 'title category' } })
      .populate('artist', 'fullName profileImage')
      .sort('-orderDate')
      .lean();
    const catMap = {};
    allSales.filter(s => s.paymentStatus === 'completed').forEach(s => {
      const cat = s.marketplaceItem?.artwork?.category ?? 'Other';
      if (!catMap[cat]) catMap[cat] = { category: cat, sales: 0, revenue: 0, quantity: 0 };
      catMap[cat].sales += 1; catMap[cat].revenue += s.totalAmount; catMap[cat].quantity += s.quantity;
    });
    const categoryBreakdown = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
    res.status(200).json({
      success: true,
      data: { summary: { totalSales, totalRevenue, totalQuantity, averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0 }, salesByPeriod, topArtists, topItems, categoryBreakdown, allSales },
    });
  } catch (error) {
    console.error('Province sales stats error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving sales statistics', error: error.message });
  }
};

//admin-get artist revenue detail
exports.getArtistRevenueDetail = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { period, startDate, endDate } = req.query;
    const artist = await Artist.findById(artistId).populate('user', 'province email');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only view artists in your province' });
    let dateQuery = { artist: artist._id };
    if (startDate && endDate) {
      dateQuery.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period && period !== 'all') {
      const periodMap = { today: 0, week: 7, month: 30, year: 365 };
      if (periodMap[period] !== undefined) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - periodMap[period]);
        dateQuery.orderDate = { $gte: daysAgo };
      }
    }
    const allSales = await Sale.find(dateQuery)
      .populate({ path: 'marketplaceItem', select: 'listingTitle price', populate: { path: 'artwork', select: 'title category images' } })
      .sort('-orderDate')
      .lean();
    const completedSales = allSales.filter(s => s.paymentStatus === 'completed');
    const itemMap = {};
    completedSales.forEach(s => {
      const itemId = s.marketplaceItem?._id?.toString() ?? 'unknown';
      const title  = s.marketplaceItem?.listingTitle ?? 'Unknown Item';
      const cat    = s.marketplaceItem?.artwork?.category ?? 'Other';
      const image  = s.marketplaceItem?.artwork?.images?.[0] ?? null;
      if (!itemMap[itemId]) itemMap[itemId] = { itemId, title, category: cat, image, sales: 0, quantity: 0, revenue: 0 };
      itemMap[itemId].sales += 1; itemMap[itemId].quantity += s.quantity; itemMap[itemId].revenue += s.totalAmount;
    });
    const itemBreakdown = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);
    const monthlyTrend  = await Sale.aggregate([
      { $match: { ...dateQuery, paymentStatus: 'completed' } },
      { $group: { _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' }, quantity: { $sum: '$quantity' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const listings = await MarketplaceItem.find({ artist: artist._id }).populate('artwork', 'title category images').lean();
    res.status(200).json({
      success: true,
      data: {
        artist: { _id: artist._id, fullName: artist.fullName, profilePhoto: artist.profilePhoto, profileImage: artist.profileImage, specialization: artist.specialization, email: artist.user.email },
        summary: { totalSales: completedSales.length, totalRevenue: completedSales.reduce((sum, s) => sum + s.totalAmount, 0), totalQuantity: completedSales.reduce((sum, s) => sum + s.quantity, 0), totalListings: listings.length },
        itemBreakdown, monthlyTrend,
        listings: listings.map(l => ({ _id: l._id, title: l.listingTitle, category: l.artwork?.category ?? 'Other', image: l.artwork?.images?.[0] ?? null, price: l.price, status: l.status, totalSales: l.totalSales ?? 0, totalRevenue: l.totalRevenue ?? 0 })),
        recentSales: allSales.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Artist revenue detail error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving artist revenue', error: error.message });
  }
};

// admin-toggle featured
exports.toggleFeatured = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You cannot manage items from another province' });
    item.isFeatured = !item.isFeatured;
    await item.save();
    res.status(200).json({ success: true, message: `Item ${item.isFeatured ? 'featured' : 'unfeatured'}`, data: { isFeatured: item.isFeatured } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling featured status', error: error.message });
  }
};

// admin-delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Marketplace item not found' });
    const artist = await Artist.findById(item.artist).populate('user');
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only delete items from your province' });
    await item.deleteOne();
    res.json({ success: true, message: 'Marketplace item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting marketplace item', error: error.message });
  }
};