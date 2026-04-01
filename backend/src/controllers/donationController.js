const Donation = require('../models/Donation');
const Artist   = require('../models/Artist');
const Event    = require('../models/Event');
const User     = require('../models/User');
const { sendDonationConfirmation } = require('../services/emailService');
const { createNotification }       = require('../services/notificationHelper');

async function getProvinceAdminUser(province) {
  if (!province || province === 'All Provinces') return null;
  return User.findOne({ role: 'admin', province });
}

exports.createDonation = async (req, res) => {
  try {
    const { donor, amount, purpose, targetArtist, targetEvent, allocatedProvince, message, paymentMethod } = req.body;
    if (!donor || !donor.fullName || !donor.email)
      return res.status(400).json({ success: false, message: 'Please provide donor full name and email' });
    if (!amount || amount < 100)
      return res.status(400).json({ success: false, message: 'Minimum donation amount is Rs. 100' });
    if (targetArtist) { const a = await Artist.findById(targetArtist); if (!a) return res.status(404).json({ success: false, message: 'Artist not found' }); }
    if (targetEvent)  { const e = await Event.findById(targetEvent);   if (!e) return res.status(404).json({ success: false, message: 'Event not found' }); }

    const donation = await Donation.create({
      donor: { fullName: donor.fullName, email: donor.email, phone: donor.phone || '', country: donor.country || 'Sri Lanka', isAnonymous: donor.isAnonymous === true || donor.isAnonymous === 'true' },
      amount, purpose: purpose || 'general', targetArtist: targetArtist || null, targetEvent: targetEvent || null,
      allocatedProvince: allocatedProvince || 'All Provinces', message: message || '', paymentMethod: paymentMethod || 'card', paymentStatus: 'pending',
    });

    res.status(201).json({ success: true, message: 'Donation record created. Please complete the payment.', data: { donationId: donation._id, amount: donation.amount, donor: donation.donor.isAnonymous ? 'Anonymous' : donation.donor.fullName } });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ success: false, message: 'Error creating donation record', error: error.message });
  }
};

exports.getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('targetArtist', 'fullName province specialization').populate('targetEvent', 'title province startDate').populate('acknowledgedBy', 'email province');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching donation', error: error.message });
  }
};

// donations can be marked as completed either via payment gateway callback or manually by admin (for bank transfers)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId, paymentStatus, orderId, paymentId, statusCode, statusMessage } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    donation.paymentStatus = paymentStatus;
    if (transactionId) donation.transactionId = transactionId;
    donation.paymentDetails = { orderId, paymentId, statusCode, statusMessage };
    if (paymentStatus === 'completed') donation.paidAt = Date.now();
    await donation.save();

    sendDonationConfirmation(donation).catch(() => {});

    // notify province admin when a donation is completed
    if (paymentStatus === 'completed') {
      const io        = req.app.get('io');
      const adminUser = await getProvinceAdminUser(donation.allocatedProvince);
      if (adminUser) {
        createNotification(io, {
          recipientUserId: adminUser._id.toString(),
          recipientRole:   'admin',
          province:        donation.allocatedProvince,
          type:            'DONATION_RECEIVED',
          title:           'New Donation Received!',
          message:         `A donation of LKR ${donation.amount.toLocaleString()} was received from ${donation.donor.isAnonymous ? 'Anonymous' : donation.donor.fullName}.`,
          data: { donationId: donation._id, amount: donation.amount },
        });
      }
    }

    res.status(200).json({ success: true, message: 'Payment status updated successfully', data: { donationId: donation._id, paymentStatus: donation.paymentStatus, receiptNumber: donation.receiptNumber } });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Error updating payment status', error: error.message });
  }
};

exports.acknowledgeDonation = async (req, res) => {
  try {
    const { notes } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    const wasAlreadyCompleted = donation.paymentStatus === 'completed';
    donation.acknowledgedBy = req.user._id; donation.acknowledgedAt = Date.now();
    donation.notes = notes || ''; donation.paymentStatus = 'completed';
    if (!donation.paidAt) donation.paidAt = Date.now();
    await donation.save();
    if (!wasAlreadyCompleted) sendDonationConfirmation(donation).catch(() => {});

    // notify admin (bank transfer acknowledgement)
    if (!wasAlreadyCompleted) {
      const io        = req.app.get('io');
      const adminUser = await getProvinceAdminUser(donation.allocatedProvince);
      if (adminUser) {
        createNotification(io, {
          recipientUserId: adminUser._id.toString(),
          recipientRole:   'admin',
          province:        donation.allocatedProvince,
          type:            'DONATION_RECEIVED',
          title:           'Donation Acknowledged!',
          message:         `A bank-transfer donation of LKR ${donation.amount.toLocaleString()} from ${donation.donor.isAnonymous ? 'Anonymous' : donation.donor.fullName} was acknowledged.`,
          data: { donationId: donation._id, amount: donation.amount },
        });
      }
    }

    res.status(200).json({ success: true, message: 'Donation acknowledged and payment marked as completed', data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error acknowledging donation', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 15; const skip = (page - 1) * limit;
    const query = {};
    if (req.query.search) { query.$or = [{ 'donor.fullName': { $regex: req.query.search, $options: 'i' } }, { 'donor.email': { $regex: req.query.search, $options: 'i' } }, { transactionId: { $regex: req.query.search, $options: 'i' } }]; }
    const donations = await Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Donation.countDocuments(query);
    res.json({ success: true, data: donations, count: donations.length, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ success: false, message: 'Error fetching donations', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Donation.countDocuments({ paymentStatus: 'completed' });
    const amountResult = await Donation.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const now = new Date(); const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1); const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const [thisMonth, lastMonth, completed, pending, failed] = await Promise.all([
      Donation.countDocuments({ paymentStatus: 'completed', createdAt: { $gte: thisMonthStart } }),
      Donation.countDocuments({ paymentStatus: 'completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Donation.countDocuments({ paymentStatus: 'completed' }), Donation.countDocuments({ paymentStatus: 'pending' }), Donation.countDocuments({ paymentStatus: 'failed' }),
    ]);
    res.json({ success: true, data: { total, amount: amountResult[0]?.total || 0, thisMonth, lastMonth, breakdown: { completed, pending, failed } } });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching donation stats', error: error.message });
  }
};

module.exports = exports;