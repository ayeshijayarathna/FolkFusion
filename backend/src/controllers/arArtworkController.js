const ARArtwork = require('../models/ARArtwork');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs   = require('fs');

const MODELS_DIR = path.join(__dirname, '../../public/models');

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('[AR] Created models directory:', MODELS_DIR);
}

console.log('[AR] Models directory:', MODELS_DIR);

/*upload thumbnail image to Cloudinary */
const uploadImage = async (base64, folder = 'ar-artworks/images') => {
  if (!base64) return '';
  if (!base64.startsWith('data:')) return base64;
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'image',
      timeout: 120000,
    });
    return result.secure_url;
  } catch (err) {
    console.error('[AR] Image upload failed:', err.message);
    return '';
  }
};

/*save GLB to local filesystem*/
const saveGLBLocal = (base64) => {
  if (!base64) return '';
  if (!base64.startsWith('data:')) return base64;

  try {
    const base64Data = base64.split(',')[1];
    if (!base64Data) return '';

    const buffer   = Buffer.from(base64Data, 'base64');
    const filename = `model_${Date.now()}.glb`;
    const filepath = path.join(MODELS_DIR, filename);

    fs.writeFileSync(filepath, buffer);
    console.log('[AR] GLB saved:', filepath, `(${(buffer.length/1024/1024).toFixed(2)}MB)`);

    return `/models/${filename}`;
  } catch (err) {
    console.error('[AR] GLB save failed:', err.message);
    return '';
  }
};

/*public*/
exports.getPublished = async (req, res) => {
  try {
    const data = await ARArtwork.find({ isPublished: true }).sort('order');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const doc = await ARArtwork.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* super admin */
exports.getAll = async (req, res) => {
  try {
    const data = await ARArtwork.find().sort('order');
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category, image, glbModel, isPublished } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const imageUrl = await uploadImage(image);
    const glbPath  = saveGLBLocal(glbModel);

    console.log('[AR Create] imageUrl:', imageUrl || '(none)');
    console.log('[AR Create] glbPath:', glbPath || '(none)');

    const count = await ARArtwork.countDocuments();
    const doc   = await ARArtwork.create({
      title,
      description: description || '',
      category:    category    || '',
      image:       imageUrl,
      glbModel:    glbPath,
      isPublished: isPublished || false,
      order:       count,
    });

    res.status(201).json({ success: true, data: doc, message: 'Created successfully!' });
  } catch (e) {
    console.error('[AR Create] Error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, category, image, glbModel, isPublished } = req.body;
    const existing = await ARArtwork.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    //image
    let imageUrl = existing.image;
    if (image === '')                    imageUrl = '';
    else if (image?.startsWith('data:')) imageUrl = await uploadImage(image);
    else if (image)                      imageUrl = image;

    // GLB
    let glbPath = existing.glbModel;
    if (glbModel === '')                    glbPath = '';
    else if (glbModel?.startsWith('data:')) glbPath = saveGLBLocal(glbModel);
    else if (glbModel)                      glbPath = glbModel;

    console.log('[AR Update] glbPath:', glbPath || '(none)');

    const doc = await ARArtwork.findByIdAndUpdate(
      req.params.id,
      { title, description, category, image: imageUrl, glbModel: glbPath, isPublished },
      { new: true }
    );

    res.json({ success: true, data: doc, message: 'Updated successfully!' });
  } catch (e) {
    console.error('[AR Update] Error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const doc = await ARArtwork.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.isPublished = !doc.isPublished;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await ARArtwork.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    // delete local GLB file
    if (doc.glbModel?.startsWith('/models/')) {
      const filepath = path.join(MODELS_DIR, path.basename(doc.glbModel));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('[AR] Deleted GLB file:', filepath);
      }
    }

    res.json({ success: true, message: 'Deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, order }) => ARArtwork.findByIdAndUpdate(id, { order })));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};