const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, default: '' },
  images:      [{ type: String }],            
  videoUrl:    { type: String, default: '' },  
  isPublished: { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
});

const learningContentSchema = new mongoose.Schema(
  {
    category:    { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    coverImage:  { type: String, default: '' },   
    isPublished: { type: Boolean, default: false },
    chapters: {
      type:    [chapterSchema],
      default: () => [
        { title: 'Introduction',          order: 0 },
        { title: 'History',               order: 1 },
        { title: 'Techniques',            order: 2 },
        { title: 'Cultural Significance', order: 3 },
        { title: 'Famous Places',         order: 4 },
        { title: 'Artworks & Images',     order: 5 },
      ],
    },
  },
  { timestamps: true }
);

const traditionalPatternSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = {
  LearningContent:    mongoose.model('LearningContent',    learningContentSchema),
  TraditionalPattern: mongoose.model('TraditionalPattern', traditionalPatternSchema),
};