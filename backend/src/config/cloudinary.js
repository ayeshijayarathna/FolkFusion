const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000
});

const artworkStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/artworks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ]
  }
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', gravity: 'face' }
    ]
  }
});

const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 900, crop: 'limit', quality: 'auto' }
    ]
  }
});

const courseStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/courses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ]
  }
});

const historicalPlacesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/historical-places',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }
    ],
    chunk_size: 6000000
  }
});

const multipleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'folkfusion/general',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ]
  }
});

const uploadArtwork = multer({
  storage: artworkStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

const uploadEvent = multer({
  storage: eventStorage,
  limits: {
    fileSize: 3 * 1024 * 1024
  }
});

const uploadCourse = multer({
  storage: courseStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadHistoricalPlace = multer({
  storage: historicalPlacesStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadMultiple = multer({
  storage: historicalPlacesStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadArtwork,
  uploadProfile,
  uploadEvent,
  uploadCourse,
  uploadHistoricalPlace,
  uploadMultiple,
  deleteImage
};