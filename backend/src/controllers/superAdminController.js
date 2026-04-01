const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');

const PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
];

//sign JWT 
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

//super admin login 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const user = await User.findOne({ email: email.toLowerCase(), role: 'superAdmin' }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated.' });

    const profile = await SuperAdmin.findOne({ user: user._id });

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: profile?.fullName || 'Super Administrator',
          profilePhoto: profile?.profilePhoto || ''
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// get current super admin profile
exports.getMe = async (req, res) => {
  try {
    const profile = await SuperAdmin.findOne({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        fullName: profile?.fullName || 'Super Administrator',
        profilePhoto: profile?.profilePhoto || '',
        phoneNumber: profile?.phoneNumber || ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

//change own password
exports.changeOwnPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    //issue new token after password change
    const token = signToken(user._id);

    res.status(200).json({ success: true, message: 'Password changed successfully.', token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

//get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const adminUsers = await User.find({ role: 'admin' }).sort({ province: 1 });

    const adminsWithProfiles = await Promise.all(
      adminUsers.map(async (u) => {
        const profile = await Admin.findOne({ user: u._id });
        return {
          id: u._id,
          email: u.email,
          province: u.province,
          isActive: u.isActive,
          isApproved: u.isApproved,
          createdAt: u.createdAt,
          fullName: profile?.fullName || '',
          phoneNumber: profile?.phoneNumber || '',
          whatsappNumber: profile?.whatsappNumber || '',
          profilePhoto: profile?.profilePhoto || '',
          address: profile?.address || {}
        };
      })
    );

    res.status(200).json({ success: true, count: adminsWithProfiles.length, data: adminsWithProfiles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// get single admin by id
exports.getAdminById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const profile = await Admin.findOne({ user: user._id });
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        province: user.province,
        isActive: user.isActive,
        isApproved: user.isApproved,
        fullName: profile?.fullName || '',
        phoneNumber: profile?.phoneNumber || '',
        whatsappNumber: profile?.whatsappNumber || '',
        profilePhoto: profile?.profilePhoto || '',
        address: profile?.address || {}
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

//create new admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, province, fullName, phoneNumber } = req.body;

    if (!email || !password || !province || !fullName)
      return res.status(400).json({ success: false, message: 'email, password, province and fullName are required.' });

    if (!PROVINCES.includes(province))
      return res.status(400).json({ success: false, message: 'Invalid province.' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already in use.' });

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'admin',
      province,
      isApproved: true,
      isActive: true
    });

    const profile = await Admin.create({
      user: user._id,
      fullName,
      phoneNumber: phoneNumber || '',
      whatsappNumber: '',
      profilePhoto: '',
      address: { street: '', city: '', district: province, postalCode: '' }
    });

    res.status(201).json({
      success: true,
      message: `Admin for ${province} province created.`,
      data: { id: user._id, email: user.email, province, fullName, isActive: true }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// toggle admin active/inactive
exports.toggleAdminActive = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found.' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Admin ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { id: user._id, isActive: user.isActive }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

//reset admin password
exports.resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ _id: req.params.id, role: 'admin' }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found.' });

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found.' });

    await Admin.findOneAndDelete({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: 'Admin account deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// overview of all admins and their profiles 
exports.getOverview = async (req, res) => {
  try {
    const [totalAdmins, activeAdmins, totalArtists, activeArtists, approvedArtists] = await Promise.all([
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ role: 'artist' }),
      User.countDocuments({ role: 'artist', isActive: true }),
      User.countDocuments({ role: 'artist', isApproved: true })
    ]);

    // per province stats
    const provinceStats = await Promise.all(
      PROVINCES.map(async (province) => {
        const [adminCount, artistCount, approvedCount] = await Promise.all([
          User.countDocuments({ role: 'admin', province }),
          User.countDocuments({ role: 'artist', province }),
          User.countDocuments({ role: 'artist', province, isApproved: true })
        ]);
        return { province, adminCount, artistCount, approvedArtists: approvedCount };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totals: { totalAdmins, activeAdmins, totalArtists, activeArtists, approvedArtists },
        provinceStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};