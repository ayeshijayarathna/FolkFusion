// Groq API — fast LLaMA3 inference for artist & admin dashboard analytics
const Groq = require('groq-sdk');

const User            = require('../models/User');
const Artist          = require('../models/Artist');
const Artwork         = require('../models/Artwork');
const Sale            = require('../models/Sale');
const Inquiry         = require('../models/Inquiry');
const MarketplaceItem = require('../models/MarketplaceItem');
const Course          = require('../models/Course');
const Event           = require('../models/Event');
const Donation        = require('../models/Donation');

// helper — build the data snapshot sent to Groq
async function buildArtistSnapshot(artistId, userEmail) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    artworkStats,
    topArtworks,
    recentSales,
    salesSummary,
    listings,
    inquiries,
  ] = await Promise.all([

    // artwork overview
    Artwork.aggregate([
      { $match: { artist: artistId } },
      { $group: {
        _id:        null,
        total:      { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        forSale:    { $sum: { $cond: ['$isForSale', 1, 0] } },
        sold:       { $sum: { $cond: [{ $eq: ['$availability', 'sold'] }, 1, 0] } },
      }},
    ]),

    // top 5 artworks by views
    Artwork.find({ artist: artistId })
      .sort('-views')
      .limit(5)
      .select('title views likes category isForSale availability price')
      .lean(),

    // last 5 sales
    Sale.find({ artist: artistId, paymentStatus: 'completed' })
      .sort('-orderDate')
      .limit(5)
      .select('totalAmount quantity orderDate')
      .lean(),

    // revenue summary last 6 months
    Sale.aggregate([
      { $match: { artist: artistId, paymentStatus: 'completed', orderDate: { $gte: sixMonthsAgo } } },
      { $group: {
        _id:           null,
        totalRevenue:  { $sum: '$totalAmount' },
        totalSales:    { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
      }},
    ]),

    // listing summary
    MarketplaceItem.aggregate([
      { $match: { artist: artistId } },
      { $group: {
        _id:        null,
        total:      { $sum: 1 },
        active:     { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $eq: ['$status', 'out-of-stock'] }, 1, 0] } },
      }},
    ]),

    // inquiry summary
    Inquiry.aggregate([
      { $match: { email: userEmail, userType: 'artist' } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const aw = artworkStats[0] || {};
  const sl = salesSummary[0] || {};
  const ls = listings[0]     || {};

  const inqMap = {};
  inquiries.forEach(i => { inqMap[i._id] = i.count; });

  return {
    artworks: {
      total:      aw.total      || 0,
      totalViews: aw.totalViews || 0,
      totalLikes: aw.totalLikes || 0,
      forSale:    aw.forSale    || 0,
      sold:       aw.sold       || 0,
    },
    topArtworks: topArtworks.map(a => ({
      title:        a.title,
      views:        a.views,
      likes:        a.likes,
      category:     a.category,
      isForSale:    a.isForSale,
      availability: a.availability,
      price:        a.price?.amount || null,
    })),
    sales: {
      last6MonthsRevenue:  sl.totalRevenue  || 0,
      last6MonthsOrders:   sl.totalSales    || 0,
      last6MonthsQuantity: sl.totalQuantity || 0,
      recentSales: recentSales.map(s => ({
        amount:    s.totalAmount,
        quantity:  s.quantity,
        date:      s.orderDate,
      })),
    },
    marketplace: {
      totalListings:  ls.total      || 0,
      activeListings: ls.active     || 0,
      outOfStock:     ls.outOfStock || 0,
    },
    inquiries: {
      new:     inqMap.new     || 0,
      read:    inqMap.read    || 0,
      replied: inqMap.replied || 0,
      closed:  inqMap.closed  || 0,
    },
  };
}

// build the Groq prompt
function buildPrompt(snapshot, artistName) {
  return `You are an AI analytics assistant for FolkFusion, a Sri Lankan folk art marketplace platform.
Analyze the following artist dashboard data for ${artistName} and provide concise, actionable insights.

ARTIST DATA SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

Respond ONLY with a valid JSON object in this exact structure (no markdown, no extra text):
{
  "summary": "2-3 sentence overall performance summary",
  "insights": [
    {
      "category": "Revenue & Sales",
      "icon": "trending_up",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Top Artwork",
      "icon": "palette",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Listing Strategy",
      "icon": "store",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Inquiries",
      "icon": "message",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    }
  ],
  "topRecommendation": "The single most impactful action this artist should take right now, in 1 sentence."
}`;
}

// GET /artists/me/ai-insights
exports.getAiInsights = async (req, res) => {
  try {
    // validate Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'GROQ_API_KEY is not set in your .env file.',
      });
    }

    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist profile not found' });
    }

    // collect dashboard data
    const snapshot    = await buildArtistSnapshot(artist._id, req.user.email);
    const artistName  = artist.fullName || 'Artist';

    // call Groq API
    const groq     = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',   
      messages: [
        {
          role:    'user',
          content: buildPrompt(snapshot, artistName),
        },
      ],
      temperature:  0.4,   
      max_tokens:   1024,
      stream:       false,
    });

    const raw  = response.choices[0]?.message?.content || '';

    // parse JSON response — strip any accidental markdown fences
    let insights;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      insights    = JSON.parse(clean);
    } catch {
      console.error('Groq response parse error. Raw:', raw);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. Please try again.',
      });
    }

    res.status(200).json({
      success:      true,
      generatedAt:  new Date().toISOString(),
      data:         insights,
    });

  } catch (error) {
    console.error('AI insights error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: 'AI insights generation failed.',
      error:   error?.message,
    });
  }
};

// admin AI insights 
async function buildAdminSnapshot(province) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const artistUsers = await User.find({ role: 'artist', province }).select('_id isApproved isActive').lean();
  const artistUserIds = artistUsers.map(u => u._id);

  const [
    artistStats,
    salesStats,
    courseStats,
    eventStats,
    inquiryStats,
    donationStats,
  ] = await Promise.all([
    // artists
    Artist.aggregate([
      { $match: { user: { $in: artistUserIds } } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
      { $group: {
        _id:      null,
        total:    { $sum: 1 },
        approved: { $sum: { $cond: ['$userDoc.isApproved', 1, 0] } },
        active:   { $sum: { $cond: ['$userDoc.isActive',   1, 0] } },
      }},
    ]),
    // province sales last 6 months
    Sale.aggregate([
      { $match: { province, paymentStatus: 'completed', orderDate: { $gte: sixMonthsAgo } } },
      { $group: {
        _id:           null,
        totalRevenue:  { $sum: '$totalAmount' },
        totalSales:    { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        avgOrderValue: { $avg: '$totalAmount' },
      }},
    ]),
    // courses
    Course.aggregate([
      { $match: { province } },
      { $group: {
        _id:      null,
        total:    { $sum: 1 },
        active:   { $sum: { $cond: [{ $eq: ['$status', 'active']   }, 1, 0] } },
        upcoming: { $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] } },
        enrolled: { $sum: '$enrolledStudents' },
      }},
    ]),
    // events
    Event.aggregate([
      { $match: { province } },
      { $group: {
        _id:      null,
        total:    { $sum: 1 },
        upcoming: { $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] } },
        ongoing:  { $sum: { $cond: [{ $eq: ['$status', 'ongoing']  }, 1, 0] } },
      }},
    ]),
    // inquiries
    Inquiry.aggregate([
      { $match: { province } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // donations 
    Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
  ]);

  const inqMap = {};
  inquiryStats.forEach(i => { inqMap[i._id] = i.count; });

  return {
    province,
    artists: {
      total:    artistStats[0]?.total    || 0,
      approved: artistStats[0]?.approved || 0,
      active:   artistStats[0]?.active   || 0,
      pending:  (artistStats[0]?.total || 0) - (artistStats[0]?.approved || 0),
    },
    sales: {
      last6MonthsRevenue:  salesStats[0]?.totalRevenue  || 0,
      last6MonthsOrders:   salesStats[0]?.totalSales    || 0,
      last6MonthsQuantity: salesStats[0]?.totalQuantity || 0,
      avgOrderValue:       Math.round(salesStats[0]?.avgOrderValue || 0),
    },
    courses: {
      total:    courseStats[0]?.total    || 0,
      active:   courseStats[0]?.active   || 0,
      upcoming: courseStats[0]?.upcoming || 0,
      enrolled: courseStats[0]?.enrolled || 0,
    },
    events: {
      total:    eventStats[0]?.total    || 0,
      upcoming: eventStats[0]?.upcoming || 0,
      ongoing:  eventStats[0]?.ongoing  || 0,
    },
    inquiries: {
      new:     inqMap.new     || 0,
      read:    inqMap.read    || 0,
      replied: inqMap.replied || 0,
      closed:  inqMap.closed  || 0,
    },
    donations: {
      total:  donationStats[0]?.total  || 0,
      amount: donationStats[0]?.amount || 0,
    },
  };
}

function buildAdminPrompt(snapshot) {
  return `You are an AI analytics assistant for FolkFusion, a Sri Lankan folk art heritage platform.
Analyze the following provincial admin dashboard data for the ${snapshot.province} Province admin and provide concise, actionable insights.

PROVINCE DATA SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "summary": "2-3 sentence overall province performance summary",
  "insights": [
    {
      "category": "Artists & Growth",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Revenue & Sales",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Events & Courses",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    },
    {
      "category": "Inquiries & Engagement",
      "status": "good" | "warning" | "neutral",
      "title": "short insight title",
      "detail": "1-2 sentence actionable insight"
    }
  ],
  "topRecommendation": "The single most impactful action this admin should take right now, in 1 sentence."
}`;
}

// GET /api/admin/ai-insights
exports.getAdminAiInsights = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'GROQ_API_KEY is not configured.' });
    }

    const province = req.user.province;
    if (!province) {
      return res.status(400).json({ success: false, message: 'Admin province not set.' });
    }

    const snapshot = await buildAdminSnapshot(province);

    const groq     = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: buildAdminPrompt(snapshot) }],
      temperature: 0.4,
      max_tokens:  1024,
      stream:      false,
    });

    const raw = response.choices[0]?.message?.content || '';
    let insights;
    try {
      insights = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      console.error('Admin Groq parse error. Raw:', raw);
      return res.status(500).json({ success: false, message: 'Failed to parse AI response.' });
    }

    res.status(200).json({ success: true, generatedAt: new Date().toISOString(), data: insights });
  } catch (error) {
    console.error('Admin AI insights error:', error?.message || error);
    res.status(500).json({ success: false, message: 'AI insights generation failed.', error: error?.message });
  }
};