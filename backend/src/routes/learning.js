const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

/*public */
router.get('/categories',           ctrl.getPublishedCategories);
router.get('/categories/:category', ctrl.getCategoryContent);
router.get('/patterns',             ctrl.getPublishedPatterns);
router.post('/users/register',      ctrl.registerUser);
router.post('/reviews',             ctrl.submitReview);
router.get('/reviews/approved',     ctrl.getApprovedReviews);

/* routes(protected) */

// Learning content
router.get ('/admin/all',                    protect, ctrl.getAllContents);
router.put ('/admin/:id',                    protect, ctrl.updateContent);
router.put ('/admin/:id/chapters/:idx',      protect, ctrl.updateChapter);
router.patch('/admin/:id/publish',           protect, ctrl.togglePublish);

// Traditional patterns
router.get ('/admin/patterns',               protect, ctrl.getAllPatterns);
router.post('/admin/patterns',               protect, ctrl.createPattern);
router.put ('/admin/patterns/:id',           protect, ctrl.updatePattern);
router.delete('/admin/patterns/:id',         protect, ctrl.deletePattern);

// Users
router.get ('/admin/users',                  protect, ctrl.getAllUsers);

// Reviews
router.get ('/admin/reviews',                protect, ctrl.getAdminReviews);
router.patch('/admin/reviews/:id',           protect, ctrl.updateReviewStatus);

module.exports = router;