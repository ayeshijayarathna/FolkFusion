const express = require('express');
const router = express.Router();
const {
  getAllPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  uploadImages,
  deleteImageFromPlace,
  getStats
} = require('../controllers/HistoricalplacesController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMultiple } = require('../config/cloudinary');

const safeUpload = (req, res, next) => {
  uploadMultiple.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Image upload failed. Try a smaller image or try again.',
        error: err.message
      });
    }
    next();
  });
};

// public routes
router.get('/', getAllPlaces);
router.get('/:id', getPlace);

// admin only protected routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createPlace);
router.put('/:id', updatePlace);
router.delete('/:id', deletePlace);
router.post('/:id/images', safeUpload, uploadImages);
router.delete('/:id/images', deleteImageFromPlace);
router.get('/admin/stats', getStats);

module.exports = router;