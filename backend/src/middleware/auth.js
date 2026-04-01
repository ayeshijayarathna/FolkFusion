const jwt = require('jsonwebtoken');
const User = require('../models/User');

//protect routes - checks for valid JWT and user status
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please log in again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError')
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Your token has expired. Please log in again.' });
    return res.status(500).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

//protectSuperAdmin - separate middleware for super-admin routes, checks role = 'superAdmin'
exports.protectSuperAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Super admin authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Access denied. Super admin only.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError')
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired.' });
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

// restrictTo - middleware to restrict access based on user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

exports.checkArtistApproval = (req, res, next) => {
  if (req.user.role === 'artist' && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval by your provincial admin.'
    });
  }
  next();
};

exports.checkProvinceAccess = (req, res, next) => {
  const requestedProvince = req.params.province || req.body.province || req.query.province;
  if (req.user.role === 'admin' && requestedProvince && requestedProvince !== req.user.province) {
    return res.status(403).json({
      success: false,
      message: 'You can only access data from your own province.'
    });
  }
  next();
};