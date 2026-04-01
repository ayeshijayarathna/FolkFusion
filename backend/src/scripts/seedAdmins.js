const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

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

const adminAccounts = PROVINCES.map((province, index) => ({
  email: `admin.${province.toLowerCase().replace(/\s+/g, '')}@folkfusion.lk`,
  password: 'Admin@123456', 
  role: 'admin',
  province,
  isApproved: true,
  isActive: true
}));

const seedAdmins = async () => {
  try {
    //connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Checking for missing admin accounts...\n');
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const adminData of adminAccounts) {
      const existingAdmin = await User.findOne({ 
        email: adminData.email,
        role: 'admin' 
      });
      
      if (existingAdmin) {
        console.log(`✓ Admin already exists: ${adminData.email} (${adminData.province})`);
        existingCount++;
      } else {
        //create new admin account
        await User.create(adminData);
        console.log(`✓ Created admin: ${adminData.email} (${adminData.province})`);
        createdCount++;
      }
    }

    console.log('\n-----------------------------------------------');
    console.log(`Summary: ${existingCount} existing, ${createdCount} newly created`);
    console.log('-----------------------------------------------\n');

    if (createdCount > 0) {
      console.log('Newly Created Admin Credentials:');
      console.log('-----------------------------------------------');
      
      for (const adminData of adminAccounts) {
        const exists = await User.findOne({ email: adminData.email });
        if (exists && exists.createdAt > new Date(Date.now() - 5000)) {
          console.log(`\n${adminData.province} Province:`);
          console.log(`  Email: ${adminData.email}`);
          console.log(`  Password: ${adminData.password}`);
        }
      }
      
      console.log('\n IMPORTANT: Change these passwords in production!');
      console.log('-----------------------------------------------\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
};
seedAdmins();