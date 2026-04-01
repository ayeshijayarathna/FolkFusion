const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMultiple } = require('../config/cloudinary');

// public routes
router.get('/', courseController.getCourses);
router.get('/featured', courseController.getFeaturedCourses); 
router.get('/stats', courseController.getCourseStats);       
router.get('/:id', courseController.getCourseById);

// admin only protected routes
router.use(protect);
router.use(restrictTo('admin'));

//crud routes-admin manages their own province's courses
router.post('/', uploadMultiple.array('images', 5), courseController.createCourse);
router.put('/:id', uploadMultiple.array('images', 5), courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// status & featured toggle
router.patch('/:id/status', courseController.updateCourseStatus);
router.patch('/:id/featured', courseController.toggleFeatured);

module.exports = router;