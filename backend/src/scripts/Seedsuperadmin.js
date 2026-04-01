const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const SuperAdmin = require('../models/SuperAdmin');

dotenv.config();

const SUPER_ADMIN = {
  email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@folkfusion.lk',
  password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123456',
  fullName: 'FolkFusion Developer',
  phoneNumber: ''
};

const seed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected\n');

    // check if user with the email already exists
    let user = await User.findOne({ email: SUPER_ADMIN.email });

    if (user) {
      if (user.role !== 'superAdmin') {
        console.log(`  Email ${SUPER_ADMIN.email} exists but with role "${user.role}". Aborting.`);
        process.exit(1);
      }
      console.log(`⏭  Super admin already exists: ${user.email}`);
    } else {
      user = await User.create({
        email: SUPER_ADMIN.email,
        password: SUPER_ADMIN.password,
        role: 'superAdmin',
        isApproved: true,
        isActive: true
      });
      console.log(`Created User: ${user.email}`);
    }

    // Profile for super admin
    let profile = await SuperAdmin.findOne({ user: user._id });
    if (profile) {
      console.log(`⏭  SuperAdmin profile already exists for: ${user.email}`);
    } else {
      profile = await SuperAdmin.create({
        user: user._id,
        fullName: SUPER_ADMIN.fullName,
        phoneNumber: SUPER_ADMIN.phoneNumber
      });
      console.log(` Created SuperAdmin profile: ${profile.fullName}`);
    }

    console.log('\n-----------------------------------------');
    console.log('  SUPER ADMIN CREDENTIALS');
    console.log('-----------------------------------------');
    console.log(`  Email   : ${SUPER_ADMIN.email}`);
    console.log(`  Password: ${SUPER_ADMIN.password}`);
    console.log(`  Login   : /system/super-admin`);
    console.log('-----------------------------------------');
    console.log('  CHANGE THE PASSWORD BEFORE GOING LIVE!\n');

    process.exit(0);
  } catch (err) {
    console.error(' Error:', err.message);
    process.exit(1);
  }
};

seed();