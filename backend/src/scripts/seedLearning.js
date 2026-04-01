require('dotenv').config();
const mongoose          = require('mongoose');
const connectDB         = require('../config/db');
const { LearningContent } = require('../models/LearningContent');

const ART_CATEGORIES = [
  'Batik Clothing', 'Handloom Saree', 'Folk Jewelry', 'Ceramic', 'Statues',
  'Sri Lankan Sculpture', 'Wood Carving', 'Cane Work', 'Mats', 'Hana Fiber Crafts',
  'Coconut Crafts', 'Metal Craft', 'Lacquer Work', 'Folk Mural Painting', 'Puppetry',
  'Drum Craft', 'Rabana Making', 'Traditional Masks', 'Beeralu Lace', 'Sesath Craft',
  'Palm Leaf Craft', 'Ola Leaf Manuscripts', 'Calabash Art', 'Traditional Toy Making',
  'Horn Craft', 'Gem & Traditional Jewelry Craft', 'Pottery & Clay', 'Other',
];

async function seed() {
  await connectDB();
  let created = 0;
  for (const category of ART_CATEGORIES) {
    const exists = await LearningContent.findOne({ category });
    if (!exists) {
      // chapters are auto-created by schema default
      await LearningContent.create({ category });
      console.log(`  ✓ Created: ${category}`);
      created++;
    } else {
      console.log(`  – Exists:  ${category}`);
    }
  }
  console.log(`\nDone. ${created} new categories created.`);
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });