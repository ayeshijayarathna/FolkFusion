const { LearningContent, TraditionalPattern } = require('../models/LearningContent');
const LearningUser = require('../models/LearningUser');
const Review       = require('../models/Review');
const cloudinary   = require('../config/cloudinary'); // your existing cloudinary config

/* helpers*/
const uploadBase64 = async (base64Str, folder = 'learning') => {
  if (!base64Str || !base64Str.startsWith('data:')) return base64Str; // already a URL
  const result = await cloudinary.uploader.upload(base64Str, { folder });
  return result.secure_url;
};

/* public */

exports.getPublishedCategories = async (req, res) => {
  try {
    const data = await LearningContent.find({ isPublished: true })
      .select('category description coverImage chapters');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getCategoryContent = async (req, res) => {
  try {
    const doc = await LearningContent.findOne({
      category:    decodeURIComponent(req.params.category),
      isPublished: true,
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getPublishedPatterns = async (req, res) => {
  try {
    const data = await TraditionalPattern.find().sort('order');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, province, age, userType } = req.body;
    let user = await LearningUser.findOne({ email });
    if (!user) user = await LearningUser.create({ name, email, phone, province, age, userType });
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.submitReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.json({ success: true, data: review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).sort('-createdAt').limit(20);
    res.json({ success: true, data: reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* super admin */

exports.getAllContents = async (req, res) => {
  try {
    const data = await LearningContent.find().sort('category');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateContent = async (req, res) => {
  try {
    const doc = await LearningContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateChapter = async (req, res) => {
  try {
    const { id, idx } = req.params;
    const { content, images, isPublished } = req.body;

    const doc = await LearningContent.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    // Upload any base64 images to Cloudinary
    const uploadedImages = await Promise.all(
      (images || []).map(img => uploadBase64(img, 'learning/chapters'))
    );

    const chapter = doc.chapters[idx];
    if (chapter) {
      chapter.content     = content     ?? chapter.content;
      chapter.images      = uploadedImages.length ? uploadedImages : chapter.images;
      chapter.isPublished = isPublished ?? chapter.isPublished;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.togglePublish = async (req, res) => {
  try {
    const doc = await LearningContent.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.isPublished = !doc.isPublished;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};


exports.getAllPatterns = async (req, res) => {
  try {
    const data = await TraditionalPattern.find().sort('order');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createPattern = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const imageUrl = await uploadBase64(image, 'learning/patterns');
    const count    = await TraditionalPattern.countDocuments();
    const pattern  = await TraditionalPattern.create({ title, description, image: imageUrl, order: count });
    res.json({ success: true, data: pattern });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updatePattern = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const imageUrl = await uploadBase64(image, 'learning/patterns');
    const pattern  = await TraditionalPattern.findByIdAndUpdate(
      req.params.id,
      { title, description, image: imageUrl },
      { new: true }
    );
    res.json({ success: true, data: pattern });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deletePattern = async (req, res) => {
  try {
    await TraditionalPattern.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* users and reviews */

exports.getAllUsers = async (req, res) => {
  try {
    const users = await LearningUser.find().sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAdminReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const filter     = status ? { status } : {};
    const reviews    = await Review.find(filter).sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, data: review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};