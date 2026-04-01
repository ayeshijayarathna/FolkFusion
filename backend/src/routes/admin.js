const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const courseController = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProfile, uploadMultiple } = require('../config/cloudinary');

// apply authentication and authorization middleware to all routes
router.use(protect);
router.use(restrictTo('admin'));

// admin profile routes
router.get('/profile', adminController.getMyProfile);

router.put(
  '/profile',
  uploadProfile.single('profilePhoto'),
  adminController.updateProfile
);

router.put('/change-password', adminController.changePassword);

router.get('/all-admins', adminController.getAllAdmins);

// course management routes
router.get('/courses/stats', courseController.getCourseStats);

// featured courses route 
router.get('/courses/featured', courseController.getFeaturedCourses);

// base courses routes
router.get('/courses', courseController.getCourses);

router.post(
  '/courses',
  uploadMultiple.array('images', 5),
  courseController.createCourse
);

// id-based routes
router.get('/courses/:id', courseController.getCourseById);

router.put(
  '/courses/:id',
  uploadMultiple.array('images', 5),
  courseController.updateCourse
);

router.delete('/courses/:id', courseController.deleteCourse);

// Course status update
router.patch('/courses/:id/status', courseController.updateCourseStatus);

//Toggle featured status
router.patch('/courses/:id/featured', courseController.toggleFeatured);

module.exports = router;

