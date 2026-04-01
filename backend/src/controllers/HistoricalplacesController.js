const HistoricalPlace = require('../models/Historicalplace');
const { deleteImage } = require('../config/cloudinary');

exports.getAllPlaces = async (req, res) => {
  try {
    const {
      province,
      artType,
      district,
      search,
      status,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    } else if (!req.user || req.user.role !== 'admin') {
      query.status = 'active';
    }

    if (province && province !== 'All Provinces') {
      query.province = province;
    }

    if (artType && artType !== 'All Art Forms') {
      query.artType = artType;
    }

    if (district) {
      query.district = district;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const places = await HistoricalPlace.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await HistoricalPlace.countDocuments(query);

    res.status(200).json({
      success: true,
      count: places.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: places
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching historical places',
      error: error.message
    });
  }
};

exports.getPlace = async (req, res) => {
  try {
    const place = await HistoricalPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    if (place.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    res.status(200).json({
      success: true,
      data: place
    });
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching historical place',
      error: error.message
    });
  }
};

exports.createPlace = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;

    const place = await HistoricalPlace.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Historical place created successfully',
      data: place
    });
  } catch (error) {
    console.error('Error creating place:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating historical place',
      error: error.message
    });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    let place = await HistoricalPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    req.body.updatedBy = req.user._id;

    place = await HistoricalPlace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Historical place updated successfully',
      data: place
    });
  } catch (error) {
    console.error('Error updating place:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating historical place',
      error: error.message
    });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const place = await HistoricalPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        try {
          const urlParts = imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `folkfusion/historical-places/${filename.split('.')[0]}`;
          await deleteImage(publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
    }

    await place.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Historical place deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting historical place',
      error: error.message
    });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const place = await HistoricalPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const imageUrls = req.files.map(file => file.path);
    place.images = [...place.images, ...imageUrls];
    place.updatedBy = req.user._id;
    await place.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: place
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

exports.deleteImageFromPlace = async (req, res) => {
  try {
    const place = await HistoricalPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Historical place not found'
      });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    place.images = place.images.filter(img => img !== imageUrl);
    place.updatedBy = req.user._id;
    await place.save();

    try {
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `folkfusion/historical-places/${filename.split('.')[0]}`;
      await deleteImage(publicId);
    } catch (err) {
      console.error('Error deleting image from Cloudinary:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: place
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await HistoricalPlace.countDocuments();
    const active = await HistoricalPlace.countDocuments({ status: 'active' });
    const inactive = await HistoricalPlace.countDocuments({ status: 'inactive' });
    const draft = await HistoricalPlace.countDocuments({ status: 'draft' });

    const byProvince = await HistoricalPlace.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byArtType = await HistoricalPlace.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$artType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: { total, active, inactive, draft, byProvince, byArtType }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};