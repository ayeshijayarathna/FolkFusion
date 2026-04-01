const News = require('../models/News');
const { deleteImage } = require('../config/cloudinary');

//get all news articles with filters 
exports.getAllNews = async (req, res) => {
  try {
    const {
      category,
      province,
      search,
      isFeatured,
      isPublished,
      page  = 1,
      limit = 10,
      sort  = '-date'
    } = req.query;

    const query = {};

    if (isPublished !== 'all') {
      query.isPublished = true;
    }

    if (category) query.category = category;

    if (province && province !== 'All Provinces') {
      query.province = { $in: [province, 'All Provinces'] };
    }

    if (isFeatured) query.isFeatured = isFeatured === 'true';

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { excerpt:     { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .populate('createdBy', 'email province')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await News.countDocuments(query);

    res.status(200).json({
      success:     true,
      count:       news.length,
      total,
      totalPages:  Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data:        news,
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ success: false, message: 'Error fetching news', error: error.message });
  }
};

// get news for admin's own province only
exports.getProvinceNews = async (req, res) => {
  try {
    const { category, search, isPublished, page = 1, limit = 100000 } = req.query;

    console.log('Getting province news for:', req.user.province);

    // show only this admin's own province news
    const query = {
      province: req.user.province,
    };

    if (category) query.category = category;

    if (isPublished === 'true')  query.isPublished = true;
    if (isPublished === 'false') query.isPublished = false;

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { excerpt:     { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .populate('createdBy', 'email province')
      .sort('-date')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await News.countDocuments(query);

    console.log(`Found ${news.length} news articles for province: ${req.user.province}`);

    res.status(200).json({
      success:     true,
      count:       news.length,
      total,
      totalPages:  Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data:        news,
    });
  } catch (error) {
    console.error('Get province news error:', error);
    res.status(500).json({ success: false, message: 'Error fetching province news', error: error.message });
  }
};

// get news statistics for admin's province (for dashboard)
exports.getProvinceNewsStats = async (req, res) => {
  try {
    const provinceQuery = { province: req.user.province };

    const [totalNews, publishedNews, featuredNews, byCategory] = await Promise.all([
      News.countDocuments(provinceQuery),
      News.countDocuments({ ...provinceQuery, isPublished: true }),
      News.countDocuments({ ...provinceQuery, isFeatured: true }),
      News.aggregate([
        { $match: provinceQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { totalNews, publishedNews, featuredNews, newsByCategory: byCategory },
    });
  } catch (error) {
    console.error('Get province news stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

//get single news article by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('createdBy', 'email province');

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    news.views += 1;
    await news.save();

    res.status(200).json({ success: true, data: news });
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ success: false, message: 'Error fetching news article', error: error.message });
  }
};

//get featured news articles
exports.getFeaturedNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await News.find({ isFeatured: true, isPublished: true })
      .populate('createdBy', 'email province')
      .sort('-date')
      .limit(parseInt(limit));
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (error) {
    console.error('Get featured news error:', error);
    res.status(500).json({ success: false, message: 'Error fetching featured news', error: error.message });
  }
};

//get latest news articles
 exports.getLatestNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await News.find({ isPublished: true })
      .populate('createdBy', 'email province')
      .sort('-date')
      .limit(parseInt(limit));
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({ success: false, message: 'Error fetching latest news', error: error.message });
  }
};

//create new news article
 exports.createNews = async (req, res) => {
  try {
    const { title, excerpt, description, category, date, location, province, isPublished, isFeatured } = req.body;

    if (!title || !excerpt || !description || !category || !province) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const images = req.files ? req.files.map(file => file.path) : [];
    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const news = await News.create({
      title, excerpt, description, category, images,
      date:        date || Date.now(),
      location,
      province,
      createdBy:   req.user._id,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : true,
      isFeatured:  isFeatured  === 'true'    || isFeatured  === true    || false,
    });

    await news.populate('createdBy', 'email province');

    res.status(201).json({ success: true, message: 'News article created successfully', data: news });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ success: false, message: 'Error creating news article', error: error.message });
  }
};

//update news article
 exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    // allow admin can edit any article in their own province
    if (req.user.role === 'admin' && news.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this article' });
    }

    const { title, excerpt, description, category, date, location, province, isPublished, isFeatured } = req.body;

    if (title       !== undefined) news.title       = title;
    if (excerpt     !== undefined) news.excerpt     = excerpt;
    if (description !== undefined) news.description = description;
    if (category    !== undefined) news.category    = category;
    if (date        !== undefined) news.date        = date;
    if (location    !== undefined) news.location    = location;
    if (province    !== undefined) news.province    = province;

    if (isPublished !== undefined) news.isPublished = isPublished === 'true' || isPublished === true;
    if (isFeatured  !== undefined) news.isFeatured  = isFeatured  === 'true' || isFeatured  === true;

    // replace images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      for (const imageUrl of news.images) {
        try {
          const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
          await deleteImage(publicId);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      news.images = req.files.map(file => file.path);
    }

    await news.save();
    await news.populate('createdBy', 'email province');

    res.status(200).json({ success: true, message: 'News article updated successfully', data: news });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ success: false, message: 'Error updating news article', error: error.message });
  }
};

//delete news article
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    // allow admin can delete any article in their own province
    if (req.user.role === 'admin' && news.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this article' });
    }

    for (const imageUrl of news.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await news.deleteOne();
    res.status(200).json({ success: true, message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ success: false, message: 'Error deleting news article', error: error.message });
  }
};

//toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    // allow admin can toggle featured only for their own province articles
    if (req.user.role === 'admin' && news.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this article' });
    }

    news.isFeatured = !news.isFeatured;
    await news.save();

    res.status(200).json({
      success: true,
      message: `News article ${news.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data:    news,
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ success: false, message: 'Error toggling featured status', error: error.message });
  }
};

 exports.getNewsStats = async (req, res) => {
  try {
    const totalNews     = await News.countDocuments();
    const publishedNews = await News.countDocuments({ isPublished: true });
    const featuredNews  = await News.countDocuments({ isFeatured: true });

    const newsByCategory = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const newsByProvince = await News.aggregate([
      { $match: { province: { $ne: 'All Provinces' } } },
      { $group: { _id: '$province', count: { $sum: 1 } } },
    ]);

    const recentNews = await News.find().sort('-createdAt').limit(5).select('title category date views');

    res.status(200).json({
      success: true,
      data: { totalNews, publishedNews, featuredNews, newsByCategory, newsByProvince, recentNews },
    });
  } catch (error) {
    console.error('Get news stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching news statistics', error: error.message });
  }
};