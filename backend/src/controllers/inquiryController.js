const Inquiry  = require('../models/Inquiry');
const User     = require('../models/User');
const nodemailer = require('nodemailer');
const { createNotification } = require('../services/notificationHelper');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
const FROM = process.env.EMAIL_FROM || `"FolkFusion" <${process.env.EMAIL_USER}>`;

// ─── email builders  ───────────────────────────────────────────────
function buildInquiryConfirmationEmail(inquiry) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Inquiry Received — FolkFusion</title></head><body style="background:#FFF8E7;font-family:Georgia,serif;"><div style="max-width:560px;margin:0 auto;"><div style="background:linear-gradient(135deg,#2C3E35,#1a2820);padding:36px 32px;text-align:center;"><p style="font-size:24px;font-weight:900;color:#D4AF37;margin:0;">FOLKFUSION</p><p style="font-size:11px;color:#8DAA91;margin:0;">Preserving Sri Lankan Heritage</p></div><div style="padding:32px;"><p>Dear ${inquiry.name},</p><p>Thank you for reaching out. The <strong>${inquiry.province} Province administration</strong> will get back to you within 2–3 business days.</p><p>Your message: ${inquiry.message}</p></div></div></body></html>`;
}

function buildAdminReplyEmail({ inquiry, replyMessage, adminName }) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Response to Your Inquiry — FolkFusion</title></head><body style="background:#FFF8E7;font-family:Georgia,serif;"><div style="max-width:560px;margin:0 auto;"><div style="background:linear-gradient(135deg,#2C3E35,#1a2820);padding:36px 32px;text-align:center;"><p style="font-size:24px;font-weight:900;color:#D4AF37;margin:0;">FOLKFUSION</p></div><div style="padding:32px;"><p>Dear ${inquiry.name},</p><p>The <strong>${inquiry.province} Province Administration</strong> has replied:</p><blockquote>${replyMessage}</blockquote><p>Your original message: ${inquiry.message}</p></div></div></body></html>`;
}

async function sendInquiryConfirmation(inquiry) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try { await transporter.sendMail({ from: FROM, to: inquiry.email, subject: `FolkFusion — We've received your inquiry! 📩`, html: buildInquiryConfirmationEmail(inquiry) }); }
  catch (err) { console.error('Failed to send inquiry confirmation email:', err.message); }
}

async function sendAdminReply({ inquiry, replyMessage, adminName }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try { await transporter.sendMail({ from: FROM, to: inquiry.email, subject: `FolkFusion — Response to Your Inquiry from ${inquiry.province} Province 📬`, html: buildAdminReplyEmail({ inquiry, replyMessage, adminName }) }); }
  catch (err) { console.error('Failed to send admin reply email:', err.message); }
}

// public inquiry
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, contactNo, province, address, message } = req.body;
    if (!name || !email || !contactNo || !province || !message)
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });

    const inquiry = await Inquiry.create({ name, email, contactNo, province, address, message, userType: 'public' });
    sendInquiryConfirmation(inquiry);

    // notify province admin
    const io        = req.app.get('io');
    const adminUser = await User.findOne({ role: 'admin', province });
    if (adminUser) {
      createNotification(io, {
        recipientUserId: adminUser._id.toString(),
        recipientRole:   'admin',
        province,
        type:            'INQUIRY_RECEIVED',
        title:           'New Inquiry Received',
        message:         `A new inquiry from ${name} (${email}) has been submitted.`,
        data: { inquiryId: inquiry._id },
      });
    }

    res.status(201).json({ success: true, message: 'Your inquiry has been submitted successfully. We will contact you soon!', data: inquiry });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error submitting inquiry.', error: error.message });
  }
};

// artist inquiry 
exports.createArtistInquiry = async (req, res) => {
  try {
    const { name, email, contactNo, address, message } = req.body;
    const province = req.user.province;
    if (!name || !email || !contactNo || !message)
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });

    const inquiry = await Inquiry.create({ name, email, contactNo, province, address, message, userType: 'artist', artistRef: req.user.artistProfile || null });
    sendInquiryConfirmation(inquiry);

    // notify province admin
    const io        = req.app.get('io');
    const adminUser = await User.findOne({ role: 'admin', province });
    if (adminUser) {
      createNotification(io, {
        recipientUserId: adminUser._id.toString(),
        recipientRole:   'admin',
        province,
        type:            'INQUIRY_RECEIVED',
        title:           'New Artist Inquiry',
        message:         `Artist ${name} submitted a new inquiry to ${province} Province.`,
        data: { inquiryId: inquiry._id },
      });
    }

    res.status(201).json({ success: true, message: 'Your inquiry has been submitted to the provincial administration.', data: inquiry });
  } catch (error) {
    console.error('Artist create inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error submitting inquiry.', error: error.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ email: req.user.email, userType: 'artist' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your inquiries.', error: error.message });
  }
};

exports.getProvinceInquiries = async (req, res) => {
  try {
    const adminProvince = req.user.province;
    if (!adminProvince) return res.status(400).json({ success: false, message: 'Admin province not found.' });
    const inquiries = await Inquiry.find({ province: adminProvince }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inquiries.', error: error.message });
  }
};

exports.getProvinceStats = async (req, res) => {
  try {
    const p = req.user.province;
    const [total, newCount, readCount, repliedCount, closedCount, publicCount, artistCount] = await Promise.all([
      Inquiry.countDocuments({ province: p }),
      Inquiry.countDocuments({ province: p, status: 'new' }),
      Inquiry.countDocuments({ province: p, status: 'read' }),
      Inquiry.countDocuments({ province: p, status: 'replied' }),
      Inquiry.countDocuments({ province: p, status: 'closed' }),
      Inquiry.countDocuments({ province: p, userType: 'public' }),
      Inquiry.countDocuments({ province: p, userType: 'artist' }),
    ]);
    res.status(200).json({ success: true, data: { total, new: newCount, read: readCount, replied: repliedCount, closed: closedCount, public: publicCount, artist: artistCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats.', error: error.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.province !== req.user.province) return res.status(403).json({ success: false, message: 'Access denied.' });
    if (status)                  inquiry.status    = status;
    if (adminNote !== undefined) inquiry.adminNote = adminNote;
    if (status === 'replied')    inquiry.repliedAt = new Date();
    await inquiry.save();
    res.status(200).json({ success: true, message: 'Inquiry updated.', data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inquiry.', error: error.message });
  }
};

// ─── Admin reply — Triggers: INQUIRY_REPLIED (artist side) ────────────────────
exports.replyToInquiry = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage || !replyMessage.trim())
      return res.status(400).json({ success: false, message: 'Reply message is required.' });

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.province !== req.user.province) return res.status(403).json({ success: false, message: 'Access denied.' });

    inquiry.adminNote = replyMessage.trim();
    inquiry.status    = 'replied';
    inquiry.repliedAt = new Date();
    await inquiry.save();

    if (inquiry.userType !== 'artist') {
      const adminName = req.user.fullName || req.user.email || `${inquiry.province} Admin`;
      sendAdminReply({ inquiry, replyMessage: replyMessage.trim(), adminName });
    } else {
      // Notify the artist that their inquiry got a reply
      const io          = req.app.get('io');
      const artistUser  = await User.findOne({ email: inquiry.email, role: 'artist' });
      if (artistUser) {
        createNotification(io, {
          recipientUserId: artistUser._id.toString(),
          recipientRole:   'artist',
          province:        inquiry.province,
          type:            'INQUIRY_REPLIED',
          title:           'Your Inquiry Got a Response!',
          message:         `The ${inquiry.province} Province admin has replied to your inquiry.`,
          data: { inquiryId: inquiry._id },
        });
      }
    }

    res.status(200).json({ success: true, message: inquiry.userType === 'artist' ? 'Response saved. The artist will see it in their dashboard.' : `Reply sent to ${inquiry.email} successfully.`, data: inquiry });
  } catch (error) {
    console.error('Reply inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error sending reply.', error: error.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.province !== req.user.province) return res.status(403).json({ success: false, message: 'Access denied.' });
    await inquiry.deleteOne();
    res.status(200).json({ success: true, message: 'Inquiry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting inquiry.', error: error.message });
  }
};

exports.updateMyInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.email !== req.user.email || inquiry.userType !== 'artist') return res.status(403).json({ success: false, message: 'Access denied.' });
    if (inquiry.status !== 'new') return res.status(400).json({ success: false, message: 'Cannot edit an inquiry that has already been read or replied to.' });
    const { name, email, contactNo, address, message } = req.body;
    if (name)      inquiry.name      = name.trim();
    if (email)     inquiry.email     = email.trim().toLowerCase();
    if (contactNo) inquiry.contactNo = contactNo.trim();
    if (address !== undefined) inquiry.address = address;
    if (message)   inquiry.message   = message.trim();
    await inquiry.save();
    res.status(200).json({ success: true, message: 'Inquiry updated.', data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inquiry.', error: error.message });
  }
};

exports.deleteMyInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.email !== req.user.email || inquiry.userType !== 'artist') return res.status(403).json({ success: false, message: 'Access denied.' });
    await inquiry.deleteOne();
    res.status(200).json({ success: true, message: 'Inquiry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting inquiry.', error: error.message });
  }
};