const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/learningController');
const { protect, restrictTo } = require('../middleware/auth');

const sa = [protect, restrictTo('superAdmin')];

/* Public*/
router.get ('/categories',           ctrl.getPublishedCategories);
router.get ('/categories/:category', ctrl.getCategoryContent);
router.get ('/patterns',             ctrl.getPublishedPatterns);
router.post('/users/register',       ctrl.registerUser);
router.get ('/users/:email',         ctrl.getUserByEmail);
router.post('/users/progress',       ctrl.completeChapter);
router.post('/reviews',              ctrl.submitReview);
router.get ('/reviews/approved',     ctrl.getApprovedReviews);

/*Super Admin*/
router.get   ('/admin/all',                  ...sa, ctrl.getAllContents);
router.post  ('/admin/create',               ...sa, ctrl.createContent);
router.put   ('/admin/:id',                  ...sa, ctrl.updateContent);
router.patch ('/admin/:id/meta',             ...sa, ctrl.updateCoverAndMeta);   
router.put   ('/admin/:id/chapters/:idx',    ...sa, ctrl.updateChapter);
router.patch ('/admin/:id/publish',          ...sa, ctrl.togglePublish);
router.delete('/admin/:id',                  ...sa, ctrl.deleteContent);

router.get   ('/admin/patterns',             ...sa, ctrl.getAllPatterns);
router.post  ('/admin/patterns',             ...sa, ctrl.createPattern);
router.put   ('/admin/patterns/:id',         ...sa, ctrl.updatePattern);
router.delete('/admin/patterns/:id',         ...sa, ctrl.deletePattern);

router.get   ('/admin/users',                ...sa, ctrl.getAllUsers);
router.get   ('/admin/reviews',              ...sa, ctrl.getAdminReviews);
router.patch ('/admin/reviews/:id',          ...sa, ctrl.updateReviewStatus);

module.exports = router;