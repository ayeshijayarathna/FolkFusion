const express = require('express');
const router  = express.Router();
const {
  getAllNews,
  getNewsById,
  getFeaturedNews,
  getLatestNews,
  createNews,
  updateNews,
  deleteNews,
  toggleFeatured,
  getNewsStats,
  getProvinceNews,
  getProvinceNewsStats,
} = require('../controllers/newsController');

const { protect, restrictTo } = require('../middleware/auth');
const { uploadMultiple }       = require('../config/cloudinary');

//public routes 
router.get('/',        getAllNews);
router.get('/featured', getFeaturedNews);
router.get('/latest',   getLatestNews);
router.get('/stats',    getNewsStats);

// admin province news routes
router.get('/admin/province-news',  protect, restrictTo('admin'), getProvinceNews);
router.get('/admin/province-stats', protect, restrictTo('admin'), getProvinceNewsStats);

//public single article 
router.get('/:id', getNewsById);

//admin crud routes
router.post(
  '/',
  protect,
  restrictTo('admin'),
  uploadMultiple.array('images', 5),
  createNews
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  uploadMultiple.array('images', 5),
  updateNews
);

router.delete('/:id', protect, restrictTo('admin'), deleteNews);

router.put('/:id/toggle-featured', protect, restrictTo('admin'), toggleFeatured);

module.exports = router;