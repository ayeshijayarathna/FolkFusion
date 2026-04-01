const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  category:          { type: String, required: true },
  completedChapters: [{ type: Number }], 
  startedAt:         { type: Date, default: Date.now },
  completedAt:       { type: Date },
});

const learningUserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true },
    phone:    { type: String, default: '' },
    province: { type: String, default: '' },
    age:      { type: Number },
    userType: {
      type:    String,
      enum:    ['Student', 'Undergraduate', 'Professional', 'Other'],
      default: 'Other',
    },
    progress: [progressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningUser', learningUserSchema);