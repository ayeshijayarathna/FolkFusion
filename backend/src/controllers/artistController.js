const Artist = require('../models/Artist');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


exports.getArtists = async (req, res) => {
  try {
    const {
      province, specialization, search, isVerified,
      isFeatured,                        
      page = 1, limit = 12, sort = '-createdAt'
    } = req.query;

    let query = {};

    if (province && province !== 'all' && province !== 'All Provinces') {
      const usersInProvince = await User.find({ province }).select('_id');
      query.user = { $in: usersInProvince.map(u => u._id) };
    }
    if (specialization) query.specialization = { $in: [specialization] };
    if (isVerified === 'true') query.isVerified = true;

    if (isFeatured === 'true')  query.isFeatured = true;
    if (isFeatured === 'false') query.isFeatured = false;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio:      { $regex: search, $options: 'i' } }
      ];
    }

    const artists = await Artist.find(query)
      .populate('user', 'email province isActive isApproved')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const count = await Artist.countDocuments(query);

    res.status(200).json({
      success: true,
      count: artists.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: artists
    });
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ success: false, message: 'Error fetching artists', error: error.message });
  }
};

exports.getArtist = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid artist ID format' });
    }

    const artist = await Artist.findById(req.params.id)
      .populate('user', 'email province isActive isApproved')
      .lean();

    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    const artworks = await Artwork.find({ artist: artist._id, isApproved: true })
      .sort('-createdAt')
      .limit(6)
      .select('title images category description createdAt')
      .lean();

    res.status(200).json({ success: true, data: { ...artist, artworks } });
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ success: false, message: 'Error fetching artist', error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id })
      .populate('user', 'email province isActive isApproved');

    if (!artist) {
      return res.status(404).json({ success: false, message: 'Cannot find artist profile' });
    }

    const artworks = await Artwork.find({ artist: artist._id }).sort('-createdAt').limit(10);

    res.status(200).json({
      success: true,
      data: {
        _id:              artist._id,
        fullName:         artist.fullName,
        bio:              artist.bio || '',
        profilePhoto:     artist.profilePhoto || '',
        profileImage:     artist.profileImage || null,
        phoneNumber:      artist.phoneNumber,
        dateOfBirth:      artist.dateOfBirth,
        gender:           artist.gender,
        address:          artist.address || {},
        specialization:   artist.specialization || [],
        yearsOfExperience:artist.yearsOfExperience || 0,
        certification:    artist.certification || {},
        socialMedia:      artist.socialMedia || {},
        statistics:       artist.statistics || {},
        isFeatured:       artist.isFeatured,
        featuredRank:     artist.featuredRank,
        email:            artist.user.email,
        province:         artist.user.province,
        isApproved:       artist.user.isApproved,
        isActive:         artist.user.isActive,
        createdAt:        artist.createdAt,
        updatedAt:        artist.updatedAt,
        artworks
      }
    });
  } catch (error) {
    console.error('Get artist profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });

    if (!artist) {
      return res.status(404).json({ success: false, message: 'Cannot find artist profile' });
    }

    const parse = (val) => typeof val === 'string' ? JSON.parse(val) : val;

    const address        = req.body.address        ? parse(req.body.address)        : artist.address;
    const specialization = req.body.specialization ? parse(req.body.specialization) : artist.specialization;
    const certification  = req.body.certification  ? parse(req.body.certification)  : artist.certification;
    const socialMedia    = req.body.socialMedia    ? parse(req.body.socialMedia)    : artist.socialMedia;

    artist.fullName           = req.body.fullName          !== undefined ? req.body.fullName          : artist.fullName;
    artist.phoneNumber        = req.body.phoneNumber       !== undefined ? req.body.phoneNumber       : artist.phoneNumber;
    artist.dateOfBirth        = req.body.dateOfBirth       !== undefined ? req.body.dateOfBirth       : artist.dateOfBirth;
    artist.gender             = req.body.gender            !== undefined ? req.body.gender            : artist.gender;
    artist.bio                = req.body.bio               !== undefined ? req.body.bio               : artist.bio;
    artist.yearsOfExperience  = req.body.yearsOfExperience !== undefined
      ? Number(req.body.yearsOfExperience)
      : artist.yearsOfExperience;
    artist.address        = address;
    artist.specialization = specialization;
    artist.certification  = certification;
    artist.socialMedia    = socialMedia;

    if (req.file) {
      if (artist.profileImage && artist.profileImage.publicId) {
        const { deleteImage } = require('../config/cloudinary');
        await deleteImage(artist.profileImage.publicId).catch(() => {});
      }
      artist.profilePhoto = req.file.path;
      artist.profileImage = { url: req.file.path, publicId: req.file.filename };
    }

    if (req.body.achievements) artist.achievements = req.body.achievements;

    await artist.save();
    await artist.populate('user', 'email province isApproved');

    res.status(200).json({
      success: true,
      message: 'Profile successfully updated',
      data: {
        _id:              artist._id,
        fullName:         artist.fullName,
        bio:              artist.bio,
        profilePhoto:     artist.profilePhoto || '',
        profileImage:     artist.profileImage || null,
        phoneNumber:      artist.phoneNumber,
        dateOfBirth:      artist.dateOfBirth,
        gender:           artist.gender,
        address:          artist.address,
        specialization:   artist.specialization,
        yearsOfExperience:artist.yearsOfExperience,
        certification:    artist.certification,
        socialMedia:      artist.socialMedia,
        statistics:       artist.statistics,
        isFeatured:       artist.isFeatured,
        email:            artist.user.email,
        province:         artist.user.province,
        isApproved:       artist.user.isApproved
      }
    });
  } catch (error) {
    console.error('Update artist profile error:', error);
    res.status(500).json({ success: false, message: 'Profile update error', error: error.message });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image' });
    }

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Cannot find artist profile' });
    }

    if (artist.profileImage && artist.profileImage.publicId) {
      const { deleteImage } = require('../config/cloudinary');
      await deleteImage(artist.profileImage.publicId);
    }

    artist.profilePhoto = req.file.path;
    artist.profileImage = { url: req.file.path, publicId: req.file.filename };
    await artist.save();

    res.status(200).json({
      success: true,
      message: 'Profile image successfully updated',
      data: { profilePhoto: artist.profilePhoto, profileImage: artist.profileImage }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image update error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const passwordChangedAt = new Date(Date.now() - 1000);

    await User.updateOne(
      { _id: req.user._id },
      { $set: { password: hashedPassword, passwordChangedAt } }
    );

    res.status(200).json({ success: true, message: 'Password successfully changed' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Password change error', error: error.message });
  }
};

exports.createArtist = async (req, res) => {
  try {
    const {
      fullName, email, phoneNumber, dateOfBirth, gender,
      address, specialization, bio, yearsOfExperience, certification, socialMedia
    } = req.body;

    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Please provide Full Name, Email, Phone Number' });
    }
    if (!specialization || specialization.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one specialization' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already in use' });
    }

    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
      return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
    const randomPassword = generatePassword();

    const user = await User.create({
      email,
      password: randomPassword,
      role: 'artist',
      province: req.user.province,
      isApproved: true,
      isActive: true
    });

    const artistData = {
      user: user._id, fullName, phoneNumber,
      bio: bio || '', yearsOfExperience: yearsOfExperience || 0
    };

    if (dateOfBirth) artistData.dateOfBirth = new Date(dateOfBirth);
    if (gender) artistData.gender = gender;
    if (specialization) artistData.specialization = specialization;
    if (address) artistData.address = {
      street: address.street || '', city: address.city || '',
      district: address.district || '', postalCode: address.postalCode || ''
    };
    if (certification) artistData.certification = {
      hasCertification: certification.hasCertification || false,
      certificationDetails: certification.certificationDetails || ''
    };
    if (socialMedia) artistData.socialMedia = {
      facebook: socialMedia.facebook || '', instagram: socialMedia.instagram || '',
      twitter: socialMedia.twitter || '', website: socialMedia.website || ''
    };

    const artist = await Artist.create(artistData);
    await artist.populate('user', 'email role province isApproved isActive');

    res.status(201).json({
      success: true,
      message: 'Artist successfully created',
      data: {
        artist,
        credentials: { email, password: randomPassword, message: 'Share these credentials with the artist.' }
      }
    });
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({ success: false, message: 'Error creating artist', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const province = req.user.province;
    const users    = await User.find({ role: 'artist', province }).select('_id isApproved isActive');
    const artists  = await Artist.find({ user: { $in: users.map(u => u._id) } }).populate('user', 'isApproved isActive');
    res.json({
      success: true,
      data: {
        total:    artists.length,
        approved: artists.filter(a => a.user?.isApproved === true).length,
        pending:  artists.filter(a => a.user?.isApproved === false).length,
        active:   artists.filter(a => a.user?.isActive   === true).length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Stats fetch error', error: error.message });
  }
};

exports.getProvinceArtists = async (req, res) => {
  try {
    const province = req.user.province;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    let userQuery = { role: 'artist', province };
    if (req.query.isApproved !== undefined) userQuery.isApproved = req.query.isApproved === 'true';
    if (req.query.isActive   !== undefined) userQuery.isActive   = req.query.isActive   === 'true';

    const users   = await User.find(userQuery).select('_id email');
    const userIds = users.map(u => u._id);

    let artistQuery = { user: { $in: userIds } };
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      artistQuery = { user: { $in: userIds }, $or: [{ fullName: searchRegex }, { phoneNumber: searchRegex }] };
      const emailUsers = await User.find({ ...userQuery, email: searchRegex }).select('_id');
      if (emailUsers.length > 0) artistQuery.$or.push({ user: { $in: emailUsers.map(u => u._id) } });
    }

    const total   = await Artist.countDocuments(artistQuery);
    const artists = await Artist.find(artistQuery)
      .populate('user', 'email role province isApproved isActive')
      .sort(req.query.sort || '-createdAt')
      .skip(skip).limit(limit).lean();

    const allArtists = await Artist.find({ user: { $in: userIds } })
      .populate('user', 'isApproved isActive').lean();

    res.json({
      success: true, data: artists, allData: allArtists,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get province artists error:', error);
    res.status(500).json({ success: false, message: 'Error fetching artists', error: error.message });
  }
};

exports.approveArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only approve artists in your own province' });
    await User.findByIdAndUpdate(artist.user._id, { isApproved: true });
    res.json({ success: true, message: 'Artist approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Artist approve error', error: error.message });
  }
};

exports.rejectArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only reject artists in your own province' });
    await User.findByIdAndUpdate(artist.user._id, { isApproved: false });
    res.json({ success: true, message: 'Artist rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting artist', error: error.message });
  }
};

exports.deactivateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId).populate('user');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only deactivate artists in your own province' });
    const user = await User.findById(artist.user._id);
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({
      success: true,
      message: `${artist.fullName} ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error changing status', error: error.message });
  }
};

exports.getArtistStats = async (req, res) => {
  try {
    const province = req.user.province;
    const users    = await User.find({ role: 'artist', province });
    const artists  = await Artist.find({ user: { $in: users.map(u => u._id) } });
    const stats = {
      total:    artists.length,
      approved: users.filter(u => u.isApproved).length,
      pending:  users.filter(u => !u.isApproved).length,
      active:   users.filter(u => u.isActive).length,
      verified: artists.filter(a => a.isVerified).length,
      featured: artists.filter(a => a.isFeatured).length,
      bySpecialization: {},
      recentRegistrations: users.filter(u => {
        const d = new Date(); d.setDate(d.getDate() - 30); return u.createdAt >= d;
      }).length
    };
    artists.forEach(a => a.specialization.forEach(s => {
      stats.bySpecialization[s] = (stats.bySpecialization[s] || 0) + 1;
    }));
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province)
      return res.status(403).json({ success: false, message: 'You can only delete artists in your own province' });
    await User.findByIdAndDelete(artist.user._id);
    await Artist.findByIdAndDelete(artist._id);
    res.json({ success: true, message: 'Artist and user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting artist', error: error.message });
  }
};

exports.getTopArtists = async (req, res) => {
  try {
    const province = req.user.province;
    const limit    = parseInt(req.query.limit) || 5;
    const users    = await User.find({ role: 'artist', province, isApproved: true }).select('_id');
    const userIds  = users.map(u => u._id);

    const topArtists = await Artist.aggregate([
      { $match: { user: { $in: userIds } } },
      { $lookup: { from: 'artworks', localField: '_id', foreignField: 'artist', as: 'artworks' } },
      { $project: { fullName: 1, artworksCount: { $size: '$artworks' }, totalViews: { $sum: '$artworks.views' } } },
      { $sort: { totalViews: -1 } },
      { $limit: limit }
    ]);

    res.json({ success: true, data: topArtists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Top artists fetch error', error: error.message });
  }
};

// get top 10 artists by total revenue (admin only)
exports.getTopArtistsByRevenue = async (req, res) => {
  try {
    const province = req.user.province;
    const LIMIT    = 10;

    const users    = await User.find({ role: 'artist', province, isApproved: true }).select('_id');
    const userIds  = users.map(u => u._id);
    const artists  = await Artist.find({ user: { $in: userIds } }).select('_id').lean();
    const artistIds = artists.map(a => a._id);

    const revenueData = await Sale.aggregate([
      { $match: { artist: { $in: artistIds }, paymentStatus: 'completed' } },
      {
        $group: {
          _id:          '$artist',
          totalRevenue: { $sum: '$totalAmount' },
          totalSales:   { $sum: 1 },
          totalQuantity:{ $sum: '$quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: LIMIT }
    ]);

    const populated = await Artist.populate(revenueData, [
      { path: '_id', select: 'fullName profilePhoto profileImage specialization isFeatured featuredRank featuredAt' }
    ]);

    const result = populated.map((item, idx) => ({
      rank:          idx + 1,
      artistId:      item._id?._id,
      fullName:      item._id?.fullName,
      profilePhoto:  item._id?.profilePhoto,
      profileImage:  item._id?.profileImage,
      specialization:item._id?.specialization,
      isFeatured:    item._id?.isFeatured ?? false,
      featuredRank:  item._id?.featuredRank ?? null,
      featuredAt:    item._id?.featuredAt ?? null,
      totalRevenue:  item.totalRevenue,
      totalSales:    item.totalSales,
      totalQuantity: item.totalQuantity,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Top artists by revenue error:', error);
    res.status(500).json({ success: false, message: 'Error fetching top artists by revenue', error: error.message });
  }
};

// toggle featured status for an artist — admin only
exports.toggleFeaturedArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user', 'province');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.user.province !== req.user.province) {
      return res.status(403).json({ success: false, message: 'You can only manage artists in your province' });
    }

    const newFeatured = req.body.featured !== undefined ? Boolean(req.body.featured) : !artist.isFeatured;

    artist.isFeatured   = newFeatured;
    artist.featuredAt   = newFeatured ? new Date() : null;
    artist.featuredRank = req.body.rank ?? (newFeatured ? artist.featuredRank : null);

    await artist.save();

    // send notification if artist is being featured
    if (newFeatured) {
      try {
        await Notification.create({
          recipient:     artist.user._id,
          recipientRole: 'artist',
          province:      req.user.province,
          type:          'ARTIST_FEATURED',
          title:         '🌟 You have been featured!',
          message:       `Congratulations! You have been selected as a featured artist in ${req.user.province} province.`,
          data:          { artistId: artist._id },
        });
      } catch (notifErr) {
        console.error('Notification create error (toggleFeatured):', notifErr);
      }
    }

    res.json({
      success: true,
      message: `${artist.fullName} ${newFeatured ? 'marked as featured' : 'removed from featured'}`,
      data: {
        artistId:     artist._id,
        fullName:     artist.fullName,
        isFeatured:   artist.isFeatured,
        featuredRank: artist.featuredRank,
        featuredAt:   artist.featuredAt,
      }
    });
  } catch (error) {
    console.error('Toggle featured artist error:', error);
    res.status(500).json({ success: false, message: 'Error updating featured status', error: error.message });
  }
};

// bulk set featured artists — sends ARTIST_FEATURED notification to NEWLY featured artists only
exports.setFeaturedBulk = async (req, res) => {
  try {
    const province = req.user.province;
    const { artistIds = [], ranks = {} } = req.body;

    if (!Array.isArray(artistIds) || artistIds.length === 0) {
      return res.status(400).json({ success: false, message: 'artistIds array is required' });
    }
    if (artistIds.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 featured artists allowed' });
    }

    const users   = await User.find({ role: 'artist', province }).select('_id');
    const userIds = users.map(u => u._id.toString());

    const artists = await Artist.find({ _id: { $in: artistIds } }).populate('user', 'province');
    const invalid = artists.filter(a => a.user?.province !== province);
    if (invalid.length > 0) {
      return res.status(403).json({ success: false, message: 'Some artists are not from your province' });
    }

    //  capture previously featured IDs — to send notifications only to NEWLY featured ones
    const previouslyFeatured = await Artist.find({
      user: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) },
      isFeatured: true,
    }).select('_id').lean();
    const previouslyFeaturedIds = new Set(previouslyFeatured.map(a => a._id.toString()));

    // unfeatured all province artists first
    await Artist.updateMany(
      { user: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } },
      { $set: { isFeatured: false, featuredRank: null, featuredAt: null } }
    );

    // feature the selected artists
    const now = new Date();
    const bulkOps = artistIds.map((id, idx) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { isFeatured: true, featuredRank: ranks[id] ?? idx + 1, featuredAt: now } }
      }
    }));
    await Artist.bulkWrite(bulkOps);

    // send notifications only to artists who were NOT previously featured
    const newlyFeaturedIds = artistIds.filter(id => !previouslyFeaturedIds.has(id.toString()));

    if (newlyFeaturedIds.length > 0) {
      const newlyFeaturedArtists = await Artist.find({ _id: { $in: newlyFeaturedIds } })
        .populate('user', '_id')
        .select('fullName user')
        .lean();

      const notifications = newlyFeaturedArtists
        .filter(a => a.user?._id)
        .map(a => ({
          recipient:     a.user._id,
          recipientRole: 'artist',
          province,
          type:          'ARTIST_FEATURED',
          title:         '🌟 You have been featured!',
          message:       `Congratulations ${a.fullName}! You have been selected as a featured artist in ${province} province.`,
          data:          { artistId: a._id },
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications).catch(err =>
          console.error('Notification insertMany error (setFeaturedBulk):', err)
        );
      }
    }

    const updatedArtists = await Artist.find({ _id: { $in: artistIds } })
      .select('fullName isFeatured featuredRank featuredAt profilePhoto profileImage')
      .sort('featuredRank')
      .lean();

    res.json({
      success: true,
      message: `${artistIds.length} artists marked as featured`,
      data: updatedArtists
    });
  } catch (error) {
    console.error('Set featured bulk error:', error);
    res.status(500).json({ success: false, message: 'Error setting featured artists', error: error.message });
  }
};

//  clear all featured artists for this province — no notifications sent on un-featuring
exports.clearAllFeatured = async (req, res) => {
  try {
    const province = req.user.province;

    const users   = await User.find({ role: 'artist', province }).select('_id');
    const userIds = users.map(u => u._id);

    await Artist.updateMany(
      { user: { $in: userIds } },
      { $set: { isFeatured: false, featuredRank: null, featuredAt: null } }
    );

    res.json({
      success: true,
      message: 'All featured artists cleared successfully'
    });
  } catch (error) {
    console.error('Clear all featured error:', error);
    res.status(500).json({ success: false, message: 'Error clearing featured artists', error: error.message });
  }
  
};


// ─── GET ARTIST DASHBOARD OVERVIEW ───────────────────────────────────────────
// Paste this function at the END of your existing artistController.js
// Route: GET /artists/me/dashboard-overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const Artist          = require('../models/Artist');
    const Artwork         = require('../models/Artwork');
    const Sale            = require('../models/Sale');
    const Inquiry         = require('../models/Inquiry');
    const Notification    = require('../models/Notification');
    const MarketplaceItem = require('../models/MarketplaceItem');

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist profile not found' });
    }

    const artistId    = artist._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      revenueSummary,
      revenueByMonth,
      artworkStats,
      artworkViewsByMonth,
      topArtworksByViews,
      listingsSummary,
      soldSummary,
      inquiriesByMonth,
      unreadNotifications,
      inquiryStatusBreakdown,
    ] = await Promise.all([

      // revenue KPIs
      Sale.aggregate([
        { $match: { artist: artistId, paymentStatus: 'completed' } },
        { $group: {
          _id:           null,
          totalRevenue:  { $sum: '$totalAmount' },
          totalSales:    { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        }},
      ]),

      // revenue by month (last 6 months)
      Sale.aggregate([
        { $match: { artist: artistId, paymentStatus: 'completed', orderDate: { $gte: sixMonthsAgo } } },
        { $group: {
          _id:     { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
          revenue: { $sum: '$totalAmount' },
          count:   { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // artwork stats
      Artwork.aggregate([
        { $match: { artist: artistId } },
        { $group: {
          _id:        null,
          total:      { $sum: 1 },
          forSale:    { $sum: { $cond: ['$isForSale', 1, 0] } },
          sold:       { $sum: { $cond: [{ $eq: ['$availability', 'sold'] }, 1, 0] } },
          available:  { $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] } },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
        }},
      ]),

      // iews per artwork (top 6 by views)
      Artwork.find({ artist: artistId })
        .sort('-views')
        .limit(6)
        .select('title views createdAt')
        .lean(),

      // top 5 artworks by views
      Artwork.find({ artist: artistId })
        .sort('-views')
        .limit(5)
        .select('title views likes category images availability')
        .lean(),

      // marketplace listings summary
      MarketplaceItem.aggregate([
        { $match: { artist: artistId } },
        { $group: {
          _id:           null,
          totalListings: { $sum: 1 },
          active:        { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          outOfStock:    { $sum: { $cond: [{ $eq: ['$status', 'out-of-stock'] }, 1, 0] } },
          inactive:      { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        }},
      ]),

      // real sold quantity from Sale model
      Sale.aggregate([
        { $match: { artist: artistId, paymentStatus: 'completed' } },
        { $group: {
          _id:           null,
          totalItemSold: { $sum: '$quantity' },  
          totalOrders:   { $sum: 1 },
        }},
      ]),

      // inquiries by month (last 6 months)
      Inquiry.aggregate([
        { $match: { email: req.user.email, userType: 'artist', createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // 9.Only unread notifications (isRead: false)
      Notification.find({ recipient: req.user._id, isRead: false })
        .sort('-createdAt')
        .limit(20)
        .select('type title message isRead createdAt data')
        .lean(),

      // 10. inquiry status breakdown
      Inquiry.aggregate([
        { $match: { email: req.user.email, userType: 'artist' } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    //month label helper 
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // build last 6 months scaffold,ensures every month shows even if 0
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const fillMonths = (data, valueKey = 'revenue') =>
      last6Months.map(({ year, month }) => {
        const found = data.find(d => d._id.year === year && d._id.month === month);
        return {
          label: MONTHS[month - 1],
          value: found ? (found[valueKey] || 0) : 0,
        };
      });

    // for artworkViewsByMonth — use ALL months present, not just last 6,
    const fillViewMonths = () =>
      last6Months.map(({ year, month }) => {
        const found = artworkViewsByMonth.find(
          d => d._id.year === year && d._id.month === month
        );
        return {
          label: MONTHS[month - 1],
          value: found ? (found.views || 0) : 0,
        };
      });

    //assemble KPI 
    const kpi = revenueSummary[0] || { totalRevenue: 0, totalSales: 0, totalQuantity: 0 };
    const aw  = artworkStats[0]   || { total: 0, forSale: 0, sold: 0, available: 0, totalViews: 0, totalLikes: 0 };
    const ls  = listingsSummary[0]|| { totalListings: 0, active: 0, outOfStock: 0, inactive: 0 };
    const sd  = soldSummary[0]    || { totalItemSold: 0, totalOrders: 0 };

    // inquiry status map
    const inqMap = { new: 0, read: 0, replied: 0, closed: 0 };
    inquiryStatusBreakdown.forEach(i => { inqMap[i._id] = i.count; });

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalRevenue:   kpi.totalRevenue,
          totalSales:     kpi.totalSales,
          totalQuantity:  kpi.totalQuantity,
          avgOrderValue:  kpi.totalSales > 0 ? kpi.totalRevenue / kpi.totalSales : 0,
          totalArtworks:  aw.total,
          totalViews:     aw.totalViews,
          totalLikes:     aw.totalLikes,
          activeListings: ls.active,
        },

        // revenue line chart
        revenueByMonth: fillMonths(revenueByMonth, 'revenue'),

        // artwork availability breakdown
        artworkBreakdown: {
          total:      aw.total,
          forSale:    aw.forSale,
          sold:       aw.sold,
          available:  aw.available,
          notForSale: aw.total - aw.forSale,
        },

        // per artwork views for bar chart
        artworkEngagement: (artworkViewsByMonth || []).map(a => ({
          label: a.title?.length > 12 ? a.title.substring(0, 12) + '…' : (a.title || 'Artwork'),
          value: a.views || 0,
        })),

        // top artworks horizontal bar
        topArtworks: topArtworksByViews.map(a => ({
          _id:          a._id,
          title:        a.title,
          views:        a.views || 0,
          likes:        a.likes || 0,
          category:     a.category,
          availability: a.availability,
          image:        a.images?.[0]?.url || null,
        })),

        // listing donut 
        listingsBreakdown: {
          active:       ls.active,
          outOfStock:   ls.outOfStock,
          inactive:     ls.inactive,
          total:        ls.totalListings,
          totalItemSold: sd.totalItemSold,
        },

        // inquiries line chart
        inquiriesByMonth: fillMonths(inquiriesByMonth, 'count'),

        // inquiry status donut
        inquiryStatus: inqMap,

        //only unread notifications
        recentNotifications: unreadNotifications,
        unreadCount: unreadNotifications.length,
      },
    });

  } catch (error) {
    console.error('getDashboardOverview error:', error);
    res.status(500).json({ success: false, message: 'Dashboard overview error', error: error.message });
  }
};