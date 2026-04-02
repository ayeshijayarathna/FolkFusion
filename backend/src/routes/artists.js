const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');
const aiInsightsController = require('../controllers/aiInsightsController');

// public routes
router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtist);

// protected routes
router.use(protect);

router.get('/me/ai-insights', restrictTo('artist'), aiInsightsController.getAiInsights);
router.get('/me/dashboard-overview', restrictTo('artist'), artistController.getDashboardOverview);


// artist profile routes
router.get('/me/profile', restrictTo('artist'), artistController.getMyProfile);
router.put(
  '/me/profile',
  restrictTo('artist'),
  uploadProfile.single('profilePhoto'),
  artistController.updateProfile
);
router.put(
  '/me/profile-image',
  restrictTo('artist'),
  uploadProfile.single('profilePhoto'),
  artistController.updateProfileImage
);
router.put('/me/change-password', restrictTo('artist'), artistController.changePassword);

// admin routes
router.use(restrictTo('admin'));

// stats & province queries
router.get('/admin/stats',                artistController.getStats);
router.get('/admin/specialization-stats', artistController.getSpecializationStats);
router.get('/admin/top',                  artistController.getTopArtists);
router.get('/admin/province',             artistController.getProvinceArtists);

// top artists ranked by total revenue - top 10
router.get('/admin/top-by-revenue',   artistController.getTopArtistsByRevenue);

// bulk set featured list
router.put('/admin/set-featured-bulk', artistController.setFeaturedBulk);

// clear all featured artists for this province
router.put('/admin/clear-featured',   artistController.clearAllFeatured);

// crud operations
router.post('/',                      artistController.createArtist);
router.put('/:id/approve',            artistController.approveArtist);
router.put('/:id/reject',             artistController.rejectArtist);
router.delete('/:id',                 artistController.deleteArtist);

// toggle individual artist featured status
router.put('/:id/toggle-featured',    artistController.toggleFeaturedArtist);

module.exports = router;