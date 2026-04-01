const Admin = require('../models/Admin');
const User = require('../models/User');

/**
 * @desc    get current admin's profile
 * @route   GET /api/admin/profile
 * @access  Private (admin only)
 */
exports.getMyProfile = async (req, res) => {
  try {
    let admin = await Admin.findOne({ user: req.user._id })
      .populate('user', 'email province isApproved');

    // create an admin profile with empty defaults (no fake data) if one doesn't already exist.
    if (!admin) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      admin = await Admin.create({
        user:           user._id,
        fullName:       '',          
        phoneNumber:    '',          
        whatsappNumber: '',         
        profilePhoto:   '',
        address: {
          street:     '',
          city:       '',
          district:   user.province || '',
          postalCode: ''
        }
      });

      await admin.populate('user', 'email province isApproved');
      console.log(' New admin profile created (empty) for:', user.email);
    }

    const profileData = {
      _id:            admin._id,
      fullName:       admin.fullName       || '',
      profilePhoto:   admin.profilePhoto   || '',
      phoneNumber:    admin.phoneNumber    || '',
      whatsappNumber: admin.whatsappNumber || '',
      address:        admin.address        || {},
      email:          admin.user.email,
      province:       admin.user.province,
      isApproved:     admin.user.isApproved,
      createdAt:      admin.createdAt,
      updatedAt:      admin.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: { profile: profileData, ...profileData }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

/**
 * @desc    update current admin's profile
 * @route   PUT /api/admin/profile
 * @access  Private (admin only)
 */
exports.updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.user._id });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Cannot find admin profile' });
    }

    let address = admin.address || {};
    if (req.body.address) {
      try {
        address = typeof req.body.address === 'string'
          ? JSON.parse(req.body.address)
          : req.body.address;
      } catch (e) {
        address = admin.address;
      }
    }

    // only update if value explicitly provided in request body
    if (req.body.fullName       !== undefined) admin.fullName       = req.body.fullName;
    if (req.body.phoneNumber    !== undefined) admin.phoneNumber    = req.body.phoneNumber;
    if (req.body.whatsappNumber !== undefined) admin.whatsappNumber = req.body.whatsappNumber;

    admin.address = {
      street:     address.street     || '',
      city:       address.city       || '',
      district:   address.district   || '',
      postalCode: address.postalCode || ''
    };

    const shouldClearPhoto = req.body.clearPhoto === 'true';
    if (shouldClearPhoto) {
      admin.profilePhoto = '';
    } else if (req.file) {
      admin.profilePhoto = req.file.path;
    }

    admin.markModified('address');
    await admin.save();
    await admin.populate('user', 'email province isApproved');

    const profileData = {
      _id:            admin._id,
      fullName:       admin.fullName       || '',
      profilePhoto:   admin.profilePhoto   || '',
      phoneNumber:    admin.phoneNumber    || '',
      whatsappNumber: admin.whatsappNumber || '',
      address:        admin.address        || {},
      email:          admin.user.email,
      province:       admin.user.province,
      isApproved:     admin.user.isApproved,
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: profileData, ...profileData }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

/**
 * @desc    change admin password
 * @route   PUT /api/admin/change-password
 * @access  Private (admin only)
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
  }
};

/**
 * @desc    get all admins
 * @route   GET /api/admin/all-admins
 * @access  Private (admin only)
 */
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('user', 'email province isApproved isActive')
      .sort({ createdAt: -1 });

    const transformedAdmins = admins.map(admin => {
      const obj = admin.toObject();
      if (obj.user) {
        obj.province   = obj.user.province;
        obj.email      = obj.user.email;
        obj.isApproved = obj.user.isApproved;
        obj.isActive   = obj.user.isActive;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: transformedAdmins.length,
      data:  transformedAdmins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ success: false, message: 'Error fetching admins', error: error.message });
  }
};