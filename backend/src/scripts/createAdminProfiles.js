const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');

dotenv.config();

const PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa'
];

const createAdminProfiles = async () => {
  try {
  
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB\n');

    const adminUsers = await User.find({ role: 'admin' }).sort({ province: 1 });
    
    if (adminUsers.length === 0) {
      console.log(' No admin users found in database!');
      console.log('Please run: npm run seed:admins first');
      process.exit(0);
    }

    console.log(` Found ${adminUsers.length} admin users\n`);

    let created = 0;
    let skipped = 0;
    let updated = 0;

    console.log('Processing admin users...\n');
    console.log('------------------------------------------------');

    for (const user of adminUsers) {
    
      let adminProfile = await Admin.findOne({ user: user._id });
      
      if (adminProfile) {
        console.log(`  Skipped: ${user.email}`);
        console.log(`   Reason: Profile already exists`);
        console.log(`   Province: ${user.province}`);
        console.log(`   Name: ${adminProfile.fullName}\n`);
        skipped++;
        continue;
      }
      const fullName = user.province 
        ? `${user.province} Province Admin` 
        : user.email.split('@')[0];

      adminProfile = await Admin.create({
        user: user._id,
        fullName: fullName,
        phoneNumber: '', 
        whatsappNumber: '',
        profilePhoto: '',
        address: {
          street: '',
          city: '',
          district: user.province || '',
          postalCode: ''
        }
      });

      console.log(`Created profile for: ${user.email}`);
      console.log(`   Province: ${user.province}`);
      console.log(`   Name: ${adminProfile.fullName}`);
      console.log(`   ID: ${adminProfile._id}\n`);
      created++;
    }

    console.log('-----------------------------------------------');
    console.log(' Admin Profile Creation Complete!');
    console.log('-----------------------------------------------');
    console.log(`Created: ${created}`);
    console.log(`⏭ Skipped: ${skipped}`);
    console.log(`Total:   ${adminUsers.length}`);
    console.log('-----------------------------------------------\n');

    if (created > 0) {
      console.log('Next Steps:');
      console.log('   Admins should update their profiles with:');
      console.log('    Correct full name');
      console.log('    Phone numbers');
      console.log('    Profile photos');
      console.log('    Complete address details');
      console.log('    WhatsApp numbers\n');
    }

    console.log('Current Admin Profiles Summary:');
    console.log('-----------------------------------------------');
    const allProfiles = await Admin.find().populate('user', 'email province isApproved isActive');
    
    if (allProfiles.length === 0) {
      console.log(' No admin profiles found!\n');
    } else {
      allProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.fullName}`);
        console.log(`   Email: ${profile.user.email}`);
        console.log(`   Province: ${profile.user.province}`);
        console.log(`   Status: ${profile.user.isActive ? 'Active' : 'Inactive'} | ${profile.user.isApproved ? ' Approved' : ' Pending'}`);
        console.log(`   Phone: ${profile.phoneNumber || ' Not set'}`);
        console.log('');
      });
    }
    console.log('-----------------------------------------------\n');

    const usersWithoutProfiles = [];
    for (const user of adminUsers) {
      const profile = await Admin.findOne({ user: user._id });
      if (!profile) {
        usersWithoutProfiles.push(user.email);
      }
    }

    if (usersWithoutProfiles.length > 0) {
      console.log('  WARNING: Some admin users still don\'t have profiles:');
      usersWithoutProfiles.forEach(email => {
        console.log(`   ${email}`);
      });
      console.log('\n');
    } else {
      console.log(' All admin users have profiles!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin profiles:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
};
process.on('SIGINT', async () => {
  console.log('\n Process interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

createAdminProfiles();