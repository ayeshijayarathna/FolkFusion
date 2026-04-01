const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const { protect, restrictTo, checkArtistApproval } = require('../middleware/auth');
const { uploadArtwork } = require('../config/cloudinary');


//public static routes 
router.get('/featured',          artworkController.getFeaturedArtworks);
router.get('/stats/by-category', artworkController.getStatsByCategory);
router.get('/',                  artworkController.getArtworks);

router.get('/:id',              artworkController.getArtwork);

// view & like are public interactions 
router.post('/:id/view',        artworkController.incrementView);
router.post('/:id/like',        artworkController.toggleLike);

//auth required routes 
router.use(protect);

//admin only routes
router.get('/stats',
  restrictTo('admin'),
  artworkController.getArtworkStats
);

router.put('/admin/:id/toggle-featured',
  restrictTo('admin'),
  artworkController.toggleFeatured
);

//artist only routes
router.get('/me/my-artworks',
  restrictTo('artist'),
  artworkController.getMyArtworks
);

router.post('/',
  restrictTo('artist'),
  checkArtistApproval,
  uploadArtwork.array('images', 5),
  artworkController.createArtwork
);

router.put('/:id',
  restrictTo('artist'),
  checkArtistApproval,
  artworkController.updateArtwork
);

router.delete('/:id',
  restrictTo('artist'),
  checkArtistApproval,
  artworkController.deleteArtwork
);

module.exports = router;