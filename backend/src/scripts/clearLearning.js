require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { LearningContent } = require('../models/LearningContent');

async function clear() {
  await connectDB();
  const result = await LearningContent.deleteMany({});
  console.log(`Deleted ${result.deletedCount} documents`);
  mongoose.disconnect();
}

clear();