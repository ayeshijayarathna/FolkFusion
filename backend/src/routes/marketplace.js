const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect, restrictTo, checkArtistApproval } = require('../middleware/auth');

//public routes
router.get('/', marketplaceController.getMarketplaceItems);
router.get('/track/:orderId', marketplaceController.trackOrder);

// auth required routes
router.use(protect);

// admin only routes
router.get('/province-items',           restrictTo('admin'), marketplaceController.getProvinceItems);
router.get('/province-sales-stats',     restrictTo('admin'), marketplaceController.getProvinceSalesStats);
router.get('/artist-revenue/:artistId', restrictTo('admin'), marketplaceController.getArtistRevenueDetail);

// artist only routes
router.get('/me/listings', restrictTo('artist'), marketplaceController.getMyListings);
router.get('/me/sales',    restrictTo('artist'), marketplaceController.getMySales);
router.get('/me/orders',                        restrictTo('artist'), marketplaceController.getMyOrders);
router.patch('/orders/:saleId/status',          restrictTo('artist'), marketplaceController.updateOrderStatus);
router.patch('/orders/:saleId/confirm-payment', restrictTo('artist'), marketplaceController.confirmPayment);
//listings management
router.post('/',      restrictTo('artist'),         checkArtistApproval, marketplaceController.createListing);
router.put('/:id',    restrictTo('artist'),         checkArtistApproval, marketplaceController.updateListing);
router.delete('/:id', restrictTo('artist', 'admin'),checkArtistApproval, marketplaceController.deleteListing);
router.post('/:id/record-sale',    restrictTo('artist', 'admin'), marketplaceController.recordSale);
router.put('/:id/toggle-featured', restrictTo('admin'),           marketplaceController.toggleFeatured);
router.get('/:id', marketplaceController.getMarketplaceItem);

module.exports = router;