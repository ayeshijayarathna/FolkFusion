const Course = require('../models/Course');
const Admin  = require('../models/Admin');
const User   = require('../models/User');
const { createNotification } = require('../services/notificationHelper');

// get all courses 
exports.getCourses = async (req, res) => {
  try {
    const {
      status, artForm, level, province, search,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = {};

    if (req.user && req.user.province) {
      query.province = req.user.province;
    } else {
      query.status = { $in: ['active', 'upcoming', 'ongoing'] };
    }

    if (status && !['all', 'All Status'].includes(status)) {
      if (req.user && req.user.province) {
        query.status = status;
      } else {
        const allowedPublicStatuses = ['active', 'upcoming', 'ongoing'];
        if (allowedPublicStatuses.includes(status)) query.status = status;
      }
    }

    if (artForm && !['all', 'All Art Forms'].includes(artForm)) query.artForm = artForm;
    if (level   && !['all', 'All Levels'].includes(level))     query.level   = level;

    if (province && !['all', 'All Provinces'].includes(province)) {
      if (!req.user || !req.user.province) query.province = province;
    }

    if (search) {
      query.$or = [
        { title:                  { $regex: search, $options: 'i' } },
        { description:            { $regex: search, $options: 'i' } },
        { 'historicalPlace.name': { $regex: search, $options: 'i' } },
        { artForm:                { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);

    const [courses, count] = await Promise.all([
      Course.find(query)
        .populate('createdBy', 'fullName')
        .sort(sort)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      Course.countDocuments(query),
    ]);

    res.json({
      success: true,
      count:   courses.length,
      total:   count,
      page:    pageNum,
      pages:   Math.ceil(count / limitNum),
      data:    courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
  }
};

//get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'fullName email phoneNumber');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (!req.user) {
      const publicStatuses = ['active', 'upcoming', 'ongoing'];
      if (!publicStatuses.includes(course.status)) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
    }

    if (req.user && req.user.province && course.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'Access denied - Course is from a different province' });
    }

    await course.incrementViews();
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ success: false, message: 'Error fetching course', error: error.message });
  }
};

// create new course (Admin only)
exports.createCourse = async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.user._id });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin profile not found' });

    const courseData = {
      title:                  req.body.title,
      description:            req.body.description,
      province:               req.user.province,
      createdBy:              admin._id,
      artForm:                req.body.artForm,
      level:                  req.body.level,
      startDate:              req.body.startDate,
      registrationDeadline:   req.body.registrationDeadline,
      languageOfInstruction:  req.body.languageOfInstruction || 'Sinhala',
      status:                 req.body.status || 'draft',
    };

    const parseField = (field, defaultValue = null) => {
      if (!req.body[field]) return defaultValue;
      try {
        return typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
      } catch { return defaultValue; }
    };

    const historicalPlace = parseField('historicalPlace');
    if (!historicalPlace?.name || !historicalPlace?.address) {
      return res.status(400).json({ success: false, message: 'Historical place name and address are required' });
    }
    courseData.historicalPlace = historicalPlace;

    const duration = parseField('duration');
    if (!duration?.weeks || !duration?.hoursPerWeek) {
      return res.status(400).json({ success: false, message: 'Duration (weeks and hours per week) is required' });
    }
    courseData.duration = duration;

    const capacity = parseField('capacity');
    if (!capacity?.maximum) {
      return res.status(400).json({ success: false, message: 'Maximum capacity is required' });
    }
    courseData.capacity = capacity;

    const fee = parseField('fee');
    if (!fee || fee.amount === undefined) {
      return res.status(400).json({ success: false, message: 'Course fee is required' });
    }
    courseData.fee = fee;

    const instructor = parseField('instructor');
    if (!instructor?.name) {
      return res.status(400).json({ success: false, message: 'Instructor name is required' });
    }
    courseData.instructor = instructor;

    const schedule      = parseField('schedule', { days: [], time: { start: '', end: '' } });
    if (schedule)        courseData.schedule = schedule;

    const certification = parseField('certification', { provided: false, details: '' });
    if (certification)   courseData.certification = certification;

    const contactPerson = parseField('contactPerson', {});
    if (contactPerson && Object.keys(contactPerson).length > 0) courseData.contactPerson = contactPerson;

    const prerequisites = parseField('prerequisites', []);
    if (Array.isArray(prerequisites)) courseData.prerequisites = prerequisites.filter(i => i?.trim());

    const materials = parseField('materials', []);
    if (Array.isArray(materials)) courseData.materials = materials.filter(i => i?.item?.trim());

    const tags = parseField('tags', []);
    if (Array.isArray(tags)) courseData.tags = tags.filter(t => t?.trim());

    if (req.files?.length > 0) courseData.images = req.files.map(file => file.path);

    const course = await Course.create(courseData);

    // notify all artists in this province about the new course
    const io = req.app.get('io');
    const provinceArtistUsers = await User.find({ role: 'artist', province: req.user.province });
    provinceArtistUsers.forEach(artistUser => {
      createNotification(io, {
        recipientUserId: artistUser._id.toString(),
        recipientRole:   'artist',
        province:        req.user.province,
        type:            'COURSE_PUBLISHED',
        title:           'New Course Available!',
        message:         `A new course "${courseData.title}" has been published in ${req.user.province} Province.`,
        data: { courseId: course._id },
      });
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: Object.values(error.errors).map(e => e.message) });
    }
    res.status(500).json({ success: false, message: 'Error creating course', error: error.message });
  }
};

// update course (Admin only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'Access denied - Cannot update a course from a different province' });
    }

    const parseField = (field) => {
      if (!req.body[field]) return null;
      try { return typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field]; }
      catch { return null; }
    };

    const updateData = {
      title:                 req.body.title,
      description:           req.body.description,
      artForm:               req.body.artForm,
      level:                 req.body.level,
      startDate:             req.body.startDate,
      registrationDeadline:  req.body.registrationDeadline,
      languageOfInstruction: req.body.languageOfInstruction,
      status:                req.body.status,
    };

    ['historicalPlace','duration','schedule','capacity','fee','instructor','certification','contactPerson'].forEach(field => {
      const parsed = parseField(field);
      if (parsed) updateData[field] = parsed;
    });

    const prerequisites = parseField('prerequisites');
    if (Array.isArray(prerequisites)) updateData.prerequisites = prerequisites.filter(i => i?.trim());

    const materials = parseField('materials');
    if (Array.isArray(materials)) updateData.materials = materials.filter(i => i?.item?.trim());

    const tags = parseField('tags');
    if (Array.isArray(tags)) updateData.tags = tags.filter(t => t?.trim());

    if (req.files?.length > 0) {
      const newImages = req.files.map(file => file.path);
      updateData.images = [...(course.images || []), ...newImages];
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('createdBy', 'fullName');

    res.json({ success: true, message: 'Course updated successfully', data: updated });
  } catch (error) {
    console.error('Update course error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: Object.values(error.errors).map(e => e.message) });
    }
    res.status(500).json({ success: false, message: 'Error updating course', error: error.message });
  }
};

// delete course (Admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'Access denied - Cannot delete a course from a different province' });
    }
    if (course.enrolledStudents > 0 && course.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot delete a course with enrolled students. Cancel the course instead.' });
    }
    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Error deleting course', error: error.message });
  }
};

// update course status (Admin only)
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft','active','upcoming','ongoing','completed','cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value' });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.province !== req.user.province) return res.status(403).json({ success: false, message: 'Access denied' });

    course.status = status;
    await course.save();
    res.json({ success: true, message: 'Course status updated successfully', data: course });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({ success: false, message: 'Error updating course status', error: error.message });
  }
};

//get course stats (Admin only)
exports.getCourseStats = async (req, res) => {
  try {
    const matchQuery = req.user?.province ? { province: req.user.province } : {};

    const [total, active, ongoing, upcoming, completed, enrollmentStats, byArtForm] = await Promise.all([
      Course.countDocuments(matchQuery),
      Course.countDocuments({ ...matchQuery, status: 'active' }),
      Course.countDocuments({ ...matchQuery, status: 'ongoing' }),
      Course.countDocuments({ ...matchQuery, status: 'upcoming' }),
      Course.countDocuments({ ...matchQuery, status: 'completed' }),
      Course.aggregate([{ $match: matchQuery }, { $group: { _id: null, totalEnrolled: { $sum: '$enrolledStudents' }, totalCapacity: { $sum: '$capacity.maximum' } } }]),
      Course.aggregate([{ $match: matchQuery }, { $group: { _id: '$artForm', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    res.json({
      success: true,
      data: {
        total, active, ongoing, upcoming, completed,
        totalEnrolled: enrollmentStats[0]?.totalEnrolled || 0,
        totalCapacity: enrollmentStats[0]?.totalCapacity || 0,
        byArtForm,
      },
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching course statistics', error: error.message });
  }
};

// get featured courses
exports.getFeaturedCourses = async (req, res) => {
  try {
    const query = { isFeatured: true, status: { $in: ['active', 'upcoming'] } };
    if (req.user?.province) query.province = req.user.province;

    const courses = await Course.find(query)
      .populate('createdBy', 'fullName')
      .sort('-views')
      .limit(6)
      .lean();

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching featured courses', error: error.message });
  }
};

// toggle featured
exports.toggleFeatured = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.province !== req.user.province) return res.status(403).json({ success: false, message: 'Access denied' });

    course.isFeatured = !course.isFeatured;
    await course.save();

    res.json({ success: true, message: `Course ${course.isFeatured ? 'featured' : 'unfeatured'} successfully`, data: course });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ success: false, message: 'Error updating featured status', error: error.message });
  }
};