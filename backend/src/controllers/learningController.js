const { LearningContent, TraditionalPattern } = require('../models/LearningContent');
const LearningUser = require('../models/LearningUser');
const Review       = require('../models/Review');
const { cloudinary } = require('../config/cloudinary');

/* cloudinary upload helper */
const uploadBase64 = async (str, folder = 'learning') => {
  if (!str || !str.startsWith('data:')) return str || '';
  if (!cloudinary) return '';
  try {
    const result = await cloudinary.uploader.upload(str, { folder });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err.message);
    return '';
  }
};

/*video URL helper */
const normalizeVideoUrl = (url) => {
  if (!url) return '';
  // YouTube watch
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo 
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const CHAPTER_TITLES = [
  'Introduction', 'History', 'Techniques',
  'Cultural Significance', 'Famous Places', 'Artworks & Images',
];

/* public*/
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
      category: decodeURIComponent(req.params.category),
      isPublished: true,
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const filtered = { ...doc.toObject(), chapters: doc.chapters.filter(ch => ch.isPublished) };
    res.json({ success: true, data: filtered });
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
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required.' });
    let user = await LearningUser.findOne({ email: email.toLowerCase() });
    if (!user) user = await LearningUser.create({ name, email: email.toLowerCase(), phone, province, age, userType });
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await LearningUser.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.completeChapter = async (req, res) => {
  try {
    const { email, category, chapterIndex } = req.body;
    if (!email || !category || chapterIndex === undefined)
      return res.status(400).json({ success: false, message: 'email, category, chapterIndex required.' });
    const user = await LearningUser.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    let progress = user.progress.find(p => p.category === category);
    if (!progress) { user.progress.push({ category, completedChapters: [], startedAt: new Date() }); progress = user.progress[user.progress.length - 1]; }
    if (!progress.completedChapters.includes(chapterIndex)) progress.completedChapters.push(chapterIndex);
    const content = await LearningContent.findOne({ category, isPublished: true });
    if (content) {
      const total = content.chapters.filter(ch => ch.isPublished).length;
      if (progress.completedChapters.length >= total && !progress.completedAt) progress.completedAt = new Date();
    }
    await user.save();
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.submitReview = async (req, res) => {
  try {
    const { userName, email, category, rating, comment } = req.body;
    if (!userName || !email || !rating || !comment)
      return res.status(400).json({ success: false, message: 'All fields required.' });
    const review = await Review.create({ userName, email, category, rating, comment });
    res.json({ success: true, data: review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getApprovedReviews = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.category = category;
    const reviews = await Review.find(filter).sort('-createdAt').limit(20);
    res.json({ success: true, data: reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* Super admin*/
exports.getAllContents = async (req, res) => {
  try {
    const data = await LearningContent.find().sort('category');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createContent = async (req, res) => {
  try {
    const { category, description, coverImage, chapters, isPublished } = req.body;
    if (!category) return res.status(400).json({ success: false, message: 'Category is required.' });
    const existing = await LearningContent.findOne({ category });
    if (existing) return res.status(400).json({ success: false, message: 'Content for this category already exists.' });

    const coverUrl = coverImage ? await uploadBase64(coverImage, 'learning/covers') : '';

    const builtChapters = await Promise.all(
      (chapters || CHAPTER_TITLES.map(t => ({ title: t, content: '', images: [], videoUrl: '', isPublished: false }))).map(async (ch, idx) => {
        // Images allowed for all chapters
        const uploadedImages = await Promise.all((ch.images || []).map(img => uploadBase64(img, 'learning/chapters')));
        return {
          title:       ch.title || CHAPTER_TITLES[idx] || `Chapter ${idx + 1}`,
          content:     ch.content || '',
          images:      uploadedImages.filter(Boolean),
          videoUrl:    normalizeVideoUrl(ch.videoUrl || ''),
          isPublished: ch.isPublished || false,
        };
      })
    );

    const doc = await LearningContent.create({
      category,
      description: description || '',
      coverImage:  coverUrl,
      chapters:    builtChapters,
      isPublished: isPublished || false,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
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
    const chapterIdx = parseInt(idx, 10);
    const { content, images, videoUrl, isPublished } = req.body;

    const doc = await LearningContent.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    // Upload images for ALL chapters (not just artworks)
    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = (await Promise.all(images.map(img => uploadBase64(img, 'learning/chapters')))).filter(Boolean);
    }

    const chapter = doc.chapters[chapterIdx];
    if (chapter) {
      chapter.content     = content     ?? chapter.content;
      chapter.isPublished = isPublished ?? chapter.isPublished;
      chapter.videoUrl    = normalizeVideoUrl(videoUrl ?? chapter.videoUrl ?? '');
      if (uploadedImages.length > 0) chapter.images = uploadedImages;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
};

/* Update cover image & description */
exports.updateCoverAndMeta = async (req, res) => {
  try {
    const { description, coverImage } = req.body;
    const doc = await LearningContent.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (description !== undefined) doc.description = description;
    if (coverImage) {
      doc.coverImage = coverImage.startsWith('data:')
        ? await uploadBase64(coverImage, 'learning/covers')
        : coverImage;
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

exports.deleteContent = async (req, res) => {
  try {
    const doc = await LearningContent.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Content deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* Patterns */
exports.getAllPatterns = async (req, res) => {
  try { res.json({ success: true, data: await TraditionalPattern.find().sort('order') }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.createPattern = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required.' });
    const imageUrl = image ? await uploadBase64(image, 'learning/patterns') : '';
    const count    = await TraditionalPattern.countDocuments();
    const pattern  = await TraditionalPattern.create({ title, description: description || '', image: imageUrl, order: count });
    res.status(201).json({ success: true, data: pattern });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.updatePattern = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const imageUrl = image?.startsWith('data:') ? await uploadBase64(image, 'learning/patterns') : image;
    const pattern  = await TraditionalPattern.findByIdAndUpdate(req.params.id, { title, description, image: imageUrl }, { new: true });
    if (!pattern) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: pattern });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.deletePattern = async (req, res) => {
  try { await TraditionalPattern.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* Users & Reviews */
exports.getAllUsers = async (req, res) => {
  try { res.json({ success: true, data: await LearningUser.find().sort('-createdAt') }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getAdminReviews = async (req, res) => {
  try {
    const { status } = req.query;
    res.json({ success: true, data: await Review.find(status ? { status } : {}).sort('-createdAt') });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};