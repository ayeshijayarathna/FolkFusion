const Artwork  = require('../models/Artwork');
const Artist   = require('../models/Artist');
const User     = require('../models/User');
const { createNotification } = require('../services/notificationHelper');

const artistId = (val) => (val?._id ?? val)?.toString();

//find the admin User for a given province 
async function getProvinceAdminUser(province) {
  return User.findOne({ role: 'admin', province });
}

// find the User record that owns an Artist document
async function getArtistUserDoc(artistObjectId) {
  const artist = await Artist.findById(artistObjectId)
    .select('user fullName')
    .populate('user', 'province');          
  if (!artist?.user) return null;
  return {
    artistDoc: artist,
    userId:    artist.user._id.toString(),
    province:  artist.user.province,      
  };
}

// get all artworks 
exports.getArtworks = async (req, res) => {
  try {
    const {
      province, category, isForSale, search,
      minPrice, maxPrice,
      page  = 1,
      limit = 12,
      sort  = '-createdAt',
    } = req.query;

    let query = { isApproved: true };

    if (province && province !== 'all') query.province = province;
    if (category)                       query.category = category;
    if (isForSale === 'true') {
      query.isForSale    = true;
      query.availability = 'available';
    }
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'fullName province profileImage')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Artwork.countDocuments(query);

    res.status(200).json({
      success:     true,
      count:       artworks.length,
      total:       count,
      totalPages:  Math.ceil(count / limit),
      currentPage: parseInt(page),
      data:        artworks,
    });
  } catch (error) {
    console.error('getArtworks error:', error);
    res.status(500).json({ success: false, message: 'Artworks fetch error', error: error.message });
  }
};

// get single artwork
exports.getArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'fullName bio province profileImage phone socialMedia');

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    const artworkData      = artwork.toObject();
    artworkData.statistics = { views: artwork.views || 0, likes: artwork.likes || 0 };

    res.status(200).json({ success: true, data: artworkData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Artwork fetch error', error: error.message });
  }
};

//increment view count (Public — no auth needed)
exports.incrementView = async (req, res) => {
  try {
        const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: false, timestamps: true }
    );

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // respond immediately
    res.status(200).json({ success: true, data: { views: artwork.views } });

    // fire notification async — every 5 views
    if (artwork.views % 5 === 0) {
      const io = req.app.get('io');
      getArtistUserDoc(artwork.artist)
        .then(result => {
          if (!result) return;
          // use province from User model via helper
          const province = result.province || artwork.province;
          if (!province) return;
          return createNotification(io, {
            recipientUserId: result.userId,
            recipientRole:   'artist',
            province,
            type:            'ARTWORK_VIEWS_MILESTONE',
            title:           'Views Milestone Reached! 👀',
            message:         `Your artwork "${artwork.title}" now has ${artwork.views} views.`,
            data:            { artworkId: artwork._id, viewCount: artwork.views },
          });
        })
        .catch(err => console.error('incrementView notification error:', err.message));
    }

  } catch (error) {
    console.error('incrementView error:', error);
    res.status(500).json({ success: false, message: 'Error incrementing view count', error: error.message });
  }
};

// ─── like artwork(Public — no auth needed) 
exports.toggleLike = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    const { action } = req.body;
    if      (action === 'like')   artwork.likes += 1;
    else if (action === 'unlike') artwork.likes = Math.max(0, artwork.likes - 1);
    else                          artwork.likes += 1;

    await artwork.save();

    // respond immediately
    res.status(200).json({
      success: true,
      data: { likes: artwork.likes, isLiked: action !== 'unlike' },
    });

    // fire notifications async after response
    if (action !== 'unlike') {
      const io = req.app.get('io');

      getArtistUserDoc(artwork.artist)
        .then(async result => {
          if (!result) return;

          // use province from User model, fallback to artwork.province
          const province = result.province || artwork.province;
          if (!province) return;

          await createNotification(io, {
            recipientUserId: result.userId,
            recipientRole:   'artist',
            province,
            type:            'ARTWORK_LIKED',
            title:           'Someone liked your artwork! ❤️',
            message:         `"${artwork.title}" received a new like. Total likes: ${artwork.likes}`,
            data:            { artworkId: artwork._id, likeCount: artwork.likes },
          });

          // artwork like 50, notification
          if (artwork.likes > 0 && artwork.likes % 50 === 0) {
            const adminUser = await getProvinceAdminUser(province);
            if (adminUser) {
              await createNotification(io, {
                recipientUserId: adminUser._id.toString(),
                recipientRole:   'admin',
                province,
                type:            'ARTWORK_LIKES_MILESTONE',
                title:           'Artwork Trending! 🔥',
                message:         `"${artwork.title}" by ${result.artistDoc.fullName} has reached ${artwork.likes} likes!`,
                data:            { artworkId: artwork._id, artistId: artwork.artist, likeCount: artwork.likes },
              });
            }
          }
        })
        .catch(err => console.error('toggleLike notification error:', err.message));
    }

  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ success: false, message: 'Error updating like count', error: error.message });
  }
};
//create artwork
exports.createArtwork = async (req, res) => {
  try {
    const {
      title, description, category,
      dimensions, materials, creationYear,
      isForSale, price, tags, availability,
    } = req.body;

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist profile not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const images = req.files.map((file, index) => ({
      url:       file.path,
      publicId:  file.filename,
      isPrimary: index === 0,
    }));

    const province = artist.province || req.user.province;
    if (!province) {
      return res.status(400).json({
        success: false,
        message: 'Province not set. Please complete your artist profile first.',
      });
    }

    const forSale = isForSale === true || isForSale === 'true';

    const doc = {
      title:        title?.trim(),
      description:  description?.trim(),
      artist:       artist._id,
      category,
      images,
      province,
      isApproved:   true,
      isForSale:    forSale,
      availability: availability || 'available',
    };

    if (creationYear) doc.creationYear = Number(creationYear);

    if (forSale) {
      if (price && typeof price === 'object' && price.amount != null) {
        doc.price = { amount: parseFloat(price.amount), currency: price.currency || 'LKR' };
      } else if (price && !isNaN(price)) {
        doc.price = { amount: parseFloat(price), currency: 'LKR' };
      }
    }
    if (dimensions) {
      doc.dimensions = {
        height: dimensions.height ? Number(dimensions.height) : undefined,
        width:  dimensions.width  ? Number(dimensions.width)  : undefined,
        depth:  dimensions.depth  ? Number(dimensions.depth)  : undefined,
        unit:   dimensions.unit   || 'cm',
      };
    }
    if (materials) {
      doc.materials = Array.isArray(materials)
        ? materials.filter(Boolean)
        : materials.split(',').map(m => m.trim()).filter(Boolean);
    }
    if (tags) {
      doc.tags = Array.isArray(tags)
        ? tags.filter(Boolean)
        : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const artwork   = await Artwork.create(doc);
    await Artist.findByIdAndUpdate(artist._id, { $inc: { 'statistics.totalArtworks': 1 } });
    const populated = await Artwork.findById(artwork._id).populate('artist', 'fullName province');

    // respond immediately
    res.status(201).json({
      success: true,
      message: 'Artwork created successfully',
      data:    populated,
    });

    // notify province admin async
    const io = req.app.get('io');
    getProvinceAdminUser(province)
      .then(adminUser => {
        if (!adminUser) return;
        return createNotification(io, {
          recipientUserId: adminUser._id.toString(),
          recipientRole:   'admin',
          province,
          type:            'ARTWORK_ADDED',
          title:           'New Artwork Added 🎨',
          message:         `${artist.fullName} added a new artwork: "${title?.trim()}"`,
          data:            { artworkId: artwork._id, artistId: artist._id },
        });
      })
      .catch(err => console.error('createArtwork notification error:', err.message));

  } catch (error) {
    console.error('createArtwork error:', error.message, error.errors);
    res.status(500).json({
      success: false,
      message: 'Artwork creation error',
      error:   error.message,
      details: error.errors
        ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v.message]))
        : undefined,
    });
  }
};

// update artwork
exports.updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist || artistId(artwork.artist) !== artist._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this artwork' });
    }

    const body = req.body;
    if (body.title        !== undefined) artwork.title        = body.title.trim();
    if (body.description  !== undefined) artwork.description  = body.description.trim();
    if (body.category     !== undefined) artwork.category     = body.category;
    if (body.availability !== undefined) artwork.availability = body.availability;
    if (body.creationYear !== undefined && body.creationYear !== '') {
      artwork.creationYear = Number(body.creationYear);
    }
    if (body.dimensions !== undefined) artwork.dimensions = body.dimensions;

    if (Object.prototype.hasOwnProperty.call(body, 'isForSale')) {
      artwork.isForSale = body.isForSale === true || body.isForSale === 'true';
    }
    if (body.price !== undefined) {
      if (typeof body.price === 'object' && body.price !== null && body.price.amount != null) {
        artwork.price = { amount: parseFloat(body.price.amount), currency: body.price.currency || 'LKR' };
      } else if (body.price !== '' && !isNaN(body.price)) {
        artwork.price = { amount: parseFloat(body.price), currency: 'LKR' };
      }
    } else if (artwork.isForSale === false) {
      artwork.price = undefined;
    }

    if (body.materials !== undefined) {
      artwork.materials = Array.isArray(body.materials)
        ? body.materials.filter(Boolean)
        : body.materials ? body.materials.split(',').map(m => m.trim()).filter(Boolean) : [];
    }
    if (body.tags !== undefined) {
      artwork.tags = Array.isArray(body.tags)
        ? body.tags.filter(Boolean)
        : body.tags ? body.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    await artwork.save();
    res.status(200).json({ success: true, message: 'Artwork updated successfully', data: artwork });
  } catch (error) {
    console.error('updateArtwork error:', error.message, error.errors);
    res.status(500).json({
      success: false, message: 'Artwork update error', error: error.message,
      details: error.errors
        ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v.message]))
        : undefined,
    });
  }
};

// delete artwork
exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist || artistId(artwork.artist) !== artist._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this artwork' });
    }

    const { deleteImage } = require('../config/cloudinary');
    for (const image of artwork.images) {
      if (image.publicId) {
        try { await deleteImage(image.publicId); }
        catch (imgErr) { console.error('Cloudinary delete failed for', image.publicId, ':', imgErr.message); }
      }
    }

    await artwork.deleteOne();
    await Artist.findByIdAndUpdate(artist._id, { $inc: { 'statistics.totalArtworks': -1 } });

    res.status(200).json({ success: true, message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('deleteArtwork error:', error);
    res.status(500).json({ success: false, message: 'Artwork deletion error', error: error.message });
  }
};

//get my artworks
exports.getMyArtworks = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist profile not found' });

    const { page = 1, limit = 50, sort = '-createdAt' } = req.query;
    const artworks = await Artwork.find({ artist: artist._id })
      .sort(sort).limit(limit * 1).skip((page - 1) * limit);
    const count = await Artwork.countDocuments({ artist: artist._id });

    res.status(200).json({
      success: true, count: artworks.length, total: count,
      totalPages: Math.ceil(count / limit), currentPage: parseInt(page), data: artworks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Artworks fetch error', error: error.message });
  }
};

// get featured artworks
exports.getFeaturedArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ isFeatured: true, isApproved: true })
      .populate('artist', 'fullName province profileImage')
      .sort('-createdAt').limit(8);
    res.status(200).json({ success: true, count: artworks.length, data: artworks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Featured artworks fetch error', error: error.message });
  }
};

// get stats by category (Admin only)
exports.getStatsByCategory = async (req, res) => {
  try {
    const { province } = req.query;
    const matchQuery   = { isApproved: true };
    if (province && province !== 'all') matchQuery.province = province;

    const stats = await Artwork.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' }, forSale: { $sum: { $cond: ['$isForSale', 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Statistics fetch error', error: error.message });
  }
};

//toggle featured (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

    if (artwork.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage artworks in another province' });
    }

    artwork.isFeatured = !artwork.isFeatured;
    await artwork.save();

    // respond immediately
    res.status(200).json({
      success: true,
      message: `Artwork ${artwork.isFeatured ? 'featured' : 'unfeatured'}`,
      data:    { isFeatured: artwork.isFeatured },
    });

    // notify artist async
    if (artwork.isFeatured) {
      const io = req.app.get('io');
      getArtistUserDoc(artwork.artist)
        .then(result => {
          if (!result) return;
          const province = result.province || artwork.province;
          if (!province) return;
          return createNotification(io, {
            recipientUserId: result.userId,
            recipientRole:   'artist',
            province,
            type:            'ARTIST_FEATURED',
            title:           'Your Artwork is Featured! ⭐',
            message:         `Congratulations! "${artwork.title}" has been featured by the admin.`,
            data:            { artworkId: artwork._id },
          });
        })
        .catch(err => console.error('toggleFeatured notification error:', err.message));
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Featured status toggle error', error: error.message });
  }
};

// get artwork stats (Admin only)
exports.getArtworkStats = async (req, res) => {
  try {
    const stats = await Artwork.aggregate([
      { $group: {
        _id: null,
        totalArtworks: { $sum: 1 },
        approved:      { $sum: { $cond: ['$isApproved', 1, 0] } },
        featured:      { $sum: { $cond: ['$isFeatured', 1, 0] } },
        totalViews:    { $sum: '$views' },
        totalLikes:    { $sum: '$likes' },
      }},
    ]);
    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Artwork stats fetch error', error: error.message });
  }
};