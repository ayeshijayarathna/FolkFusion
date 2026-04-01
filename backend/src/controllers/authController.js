const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artist = require('../models/Artist');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

//login user (artist or admin)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated. Please contact the provincial admin.'
      });
    }

    if (user.role === 'artist' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not yet approved. Please wait for provincial admin approval.'
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message
    });
  }
};

// register new artist(admin only)
exports.registerArtist = async (req, res) => {
  try {
    const {
      email,
      password,
      province,
      fullName,
      phone,
      address,
      specialization
    } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use'
      });
    }

    // verify admin may only be an artist in their own province.
    if (req.user.role === 'admin' && req.user.province !== province) {
      return res.status(403).json({
        success: false,
        message: 'You can only register artists in your own province'
      });
    }

    // create user account
    const user = await User.create({
      email,
      password,
      role: 'artist',
      province,
      isApproved: true 
    });

    // create artist profile
    const artist = await Artist.create({
      user: user._id,
      fullName,
      phone,
      province,
      address,
      specialization
    });

    res.status(201).json({
      success: true,
      message: 'Artist account created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          province: user.province
        },
        artist: {
          id: artist._id,
          fullName: artist.fullName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Artist account creation error',
      error: error.message
    });
  }
};

//create admin account (system setup only ,can be done via script)

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, province } = req.body;

    
    const existingAdmin = await User.findOne({ role: 'admin', province });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: `An admin account already exists for the province`
      });
    }

    // create admin account
    const admin = await User.create({
      email,
      password,
      role: 'admin',
      province,
      isApproved: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          province: admin.province
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin account creation error',
      error: error.message
    });
  }
};

//get current logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      province: user.province,
      isActive: user.isActive,
      isApproved: user.isApproved
    };

    if (user.role === 'artist') {
      const artist = await Artist.findOne({ user: user._id });
      userData.artistProfile = artist;
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'User data fetch error',
      error: error.message
    });
  }
};

//logout user
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};

//change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // get user with password
    const user = await User.findById(req.user._id).select('+password');

    // check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // send new token
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password change error',
      error: error.message
    });
  }
};