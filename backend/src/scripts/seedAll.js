const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const MarketplaceItem = require('../models/MarketplaceItem');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const Course = require('../models/Course');
const News = require('../models/News');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const HistoricalPlace = require('../models/Historicalplace');
const { LearningContent } = require('../models/LearningContent');
const { TraditionalPattern } = require('../models/LearningContent');
const LearningUser = require('../models/LearningUser');
const ARArtwork = require('../models/ARArtwork');

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
const SPEC = ['Batik Clothing', 'Handloom Saree', 'Folk Jewelry', 'Ceramic', 'Wood Carving', 'Lacquer Work', 'Folk Mural Painting', 'Puppetry', 'Drum Craft', 'Rabana Making', 'Traditional Masks', 'Beeralu Lace', 'Pottery & Clay', 'Metal Craft', 'Coconut Crafts'];
const PLACEHOLDER_IMG = 'https://placehold.co/600x400/2563eb/ffffff?text=';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { const s = [...arr]; const r = []; for (let i = 0; i < Math.min(n, s.length); i++) { const idx = Math.floor(Math.random() * s.length); r.push(s.splice(idx, 1)[0]); } return r; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pastDate(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; }
function futureDate(daysAhead) { const d = new Date(); d.setDate(d.getDate() + daysAhead); return d; }

const ARTIST_DATA = [
  { name: 'Kumari Perera', prov: 'Western', spec: ['Batik Clothing', 'Handloom Saree'], bio: 'Award-winning batik artist from Colombo with 15 years of experience in traditional Sri Lankan textile arts.', exp: 15, gender: 'female' },
  { name: 'Rohan Silva', prov: 'Central', spec: ['Wood Carving', 'Traditional Masks'], bio: 'Master wood carver preserving Kandyan mask-making traditions passed down through four generations.', exp: 25, gender: 'male' },
  { name: 'Nadhiya Fernando', prov: 'Southern', spec: ['Beeralu Lace', 'Handloom Saree'], bio: 'Skilled Beeralu lace maker keeping the coastal traditions of Galle alive through intricate handwork.', exp: 12, gender: 'female' },
  { name: 'Arun Rajendram', prov: 'Northern', spec: ['Pottery & Clay', 'Ceramic'], bio: 'Traditional potter from Jaffna creating contemporary pieces rooted in ancient Tamil ceramic traditions.', exp: 20, gender: 'male' },
  { name: 'Malsha Wickramasinghe', prov: 'Western', spec: ['Folk Mural Painting', 'Sri Lankan Sculpture'], bio: 'Contemporary folk artist blending traditional Kandyan painting techniques with modern themes.', exp: 8, gender: 'female' },
  { name: 'Chandana Bandara', prov: 'Central', spec: ['Lacquer Work', 'Wood Carving'], bio: 'Lacquer work specialist from Matale creating vibrant traditional pieces using natural dyes.', exp: 18, gender: 'male' },
  { name: 'Priya Jayawardena', prov: 'Uva', spec: ['Rabana Making', 'Drum Craft'], bio: 'Master rabana player and craftsman keeping the rhythmic traditions of Sabaragamuwa alive.', exp: 30, gender: 'male' },
  { name: 'Sanduni de Silva', prov: 'Sabaragamuwa', spec: ['Coconut Crafts', 'Cane Work'], bio: 'Innovative craftsperson transforming coconut shells and cane into stunning decorative art pieces.', exp: 10, gender: 'female' },
  { name: 'Kamal Perera', prov: 'North Western', spec: ['Metal Craft', 'Folk Jewelry'], bio: 'Traditional metalworker creating brass and copper jewelry inspired by ancient Sinhalese designs.', exp: 22, gender: 'male' },
  { name: 'Dilini Fernando', prov: 'Southern', spec: ['Puppetry', 'Traditional Toy Making'], bio: 'Puppeteer and toy maker preserving the art of traditional Sri Lankan string puppets.', exp: 14, gender: 'female' },
  { name: 'Lakshman Naidoo', prov: 'Eastern', spec: ['Batik Clothing', 'Folk Jewelry'], bio: 'East coast batik artist combining Tamil and Sinhalese design influences in vibrant textiles.', exp: 16, gender: 'male' },
  { name: 'Tharaka Mendis', prov: 'North Central', spec: ['Pottery & Clay', 'Statues'], bio: 'Archaeology-inspired ceramic artist recreating ancient Anuradhapura pottery forms.', exp: 9, gender: 'male' },
];

const PLACEHOLDER_ARTISTS = ['https://placehold.co/150/2563eb/ffffff?text=Artist'];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!\n');

  let artists = await Artist.find();
  let users = await User.find({ role: 'artist' });

  if (artists.length < 5) {
    console.log('Creating artist accounts...');
    for (const a of ARTIST_DATA) {
      const email = a.name.toLowerCase().replace(/\s+/g, '.') + '@folkfusion.lk';
      const existing = await User.findOne({ email });
      if (existing) continue;
      const user = await User.create({ email, password: 'Artist@123', role: 'artist', province: a.prov, isApproved: true, isActive: true });
      await Artist.create({ user: user._id, fullName: a.name, bio: a.bio, phoneNumber: `077${randInt(1000000, 9999999)}`, gender: a.gender, dateOfBirth: new Date(1970 + randInt(0, 25), randInt(0, 11), randInt(1, 28)), address: { street: `${randInt(1, 100)} Main St`, city: a.prov + ' Town', district: a.prov, postalCode: `${randInt(10000, 99999)}` }, specialization: a.spec, yearsOfExperience: a.exp, certification: { hasCertification: randInt(0, 1) === 1, certificationDetails: 'National Arts Council Certified' }, statistics: { totalArtworks: randInt(5, 30), totalViews: randInt(100, 5000), totalSales: randInt(2, 20) }, isFeatured: randInt(0, 3) === 0 });
      console.log(`  Artist: ${a.name}`);
    }
    artists = await Artist.find();
    users = await User.find({ role: 'artist' });
    console.log(`Total artists: ${artists.length}\n`);
  }

  const artworksCount = await Artwork.countDocuments();
  if (artworksCount < 5) {
    console.log('Creating artworks...');
    const artworks = [];
    const titles = [
      'Traditional Kandyan Mask', 'Batik Wall Hanging - Peacock', 'Brass Oil Lamp', 'Handloom Cotton Saree', 'Wooden Elephant Sculpture',
      'Lacquer Work Box', 'Ceramic Moonstone', 'Rabana Drum', 'Coconut Shell Bowl Set', 'Beeralu Lace Tablecloth',
      'Folk Mural - Village Scene', 'Brass Leaf Plate', 'Puppet - King Ravana', 'Pottery Water jug', 'Cane Chair Traditional',
      'Silver Temple Jewelry Set', 'Batik T-Shirt - Lion', 'Wooden Spice Grinder', 'Clay Incense Holder', 'Woven Mat - Lotus Pattern',
    ];
    const descs = [
      'Handcrafted traditional mask used in Kandyan dance performances, made from kaduru wood.',
      'Vibrant hand-dyed batik featuring the national bird in traditional wax-resist technique.',
      'Hand-beaten brass oil lamp inspired by ancient Anuradhapura designs.',
      'Authentic handloom saree woven on traditional pit looms using natural cotton.',
      'Intricately carved wooden elephant using traditional Kandyan carving techniques.',
    ];
    for (let i = 0; i < 20; i++) {
      const artist = artists[i % artists.length];
      const artwork = await Artwork.create({
        title: titles[i], description: descs[i % descs.length], artist: artist._id, category: pick(SPEC), images: [{ url: `${PLACEHOLDER_IMG}${encodeURIComponent(titles[i])}`, isPrimary: true }], province: artist.province || pick(PROVINCES), dimensions: { height: randInt(10, 100), width: randInt(10, 80), depth: randInt(5, 30), unit: 'cm' }, materials: pickN(['Wood', 'Brass', 'Cotton', 'Clay', 'Coconut Shell', 'Cane', 'Natural Dyes', 'Silver'], 3), creationYear: 2020 + randInt(0, 5), isForSale: randInt(0, 1) === 1, price: { amount: randInt(1500, 50000), currency: 'LKR' }, availability: pick(['available', 'available', 'available', 'sold']), tags: pickN(['traditional', 'handmade', 'sri-lankan', 'folk-art', 'cultural', 'heritage'], 3), views: randInt(20, 2000), likes: randInt(5, 100), isApproved: true, isFeatured: randInt(0, 4) === 0,
      });
      artworks.push(artwork);
    }
    console.log(`Created ${artworks.length} artworks\n`);

    console.log('Creating marketplace items...');
    for (const artwork of artworks.filter(a => a.isForSale)) {
      await MarketplaceItem.create({ artwork: artwork._id, artist: artwork.artist, province: artwork.province, listingTitle: artwork.title, description: artwork.description, price: { amount: artwork.price.amount, currency: 'LKR', originalPrice: Math.round(artwork.price.amount * 1.2) }, stock: { quantity: randInt(1, 10), soldQuantity: randInt(0, 5), reserved: 0 }, shipping: { available: true, methods: pickN(['standard', 'express', 'pickup'], 2), cost: randInt(200, 1500), estimatedDays: randInt(3, 10) }, status: 'active', isApproved: true, isFeatured: randInt(0, 3) === 0, analytics: { views: randInt(50, 500), favorites: randInt(5, 50), inquiries: randInt(0, 10) }, totalSales: randInt(0, 8), totalRevenue: randInt(0, 200000) });
    }
    const mpItems = await MarketplaceItem.find();
    console.log(`Created ${mpItems.length} marketplace items\n`);

    console.log('Creating sales...');
    for (let i = 0; i < 15; i++) {
      const item = pick(mpItems.length > 0 ? mpItems : [{ _id: artworks[0]._id, artist: artists[0]._id, province: 'Western' }]);
      const qty = randInt(1, 3);
      await Sale.create({ marketplaceItem: item._id || artworks[i % artworks.length]._id, artist: item.artist || artists[i % artists.length]._id, province: item.province || pick(PROVINCES), quantity: qty, unitPrice: randInt(1500, 25000), totalAmount: randInt(2000, 75000), shippingCost: randInt(200, 1500), buyer: { name: `Buyer ${i + 1}`, email: `buyer${i + 1}@example.com`, phone: `071${randInt(1000000, 9999999)}`, address: { street: `${randInt(1, 50)} Cross St`, city: 'Colombo', district: 'Western', postalCode: '00500' } }, paymentMethod: pick(['cash', 'card', 'bank-transfer']), paymentStatus: pick(['completed', 'completed', 'completed', 'pending']), orderStatus: pick(['delivered', 'shipped', 'confirmed', 'processing']), orderDate: pastDate(randInt(1, 60)) });
    }
    console.log('Created 15 sales\n');

    console.log('Creating payments...');
    for (let i = 0; i < 10; i++) {
      const item = mpItems.length > 0 ? pick(mpItems) : null;
      await Payment.create({ orderId: `ORD-${Date.now()}-${i}`, marketplaceItemId: item ? item._id : undefined, buyer: { name: `Customer ${i + 1}`, email: `customer${i + 1}@example.com`, phone: `072${randInt(1000000, 9999999)}`, address: '123 Main St', city: 'Colombo', postalCode: '00100' }, method: pick(['card', 'bank_transfer', 'cash']), amount: randInt(2000, 80000), currency: 'LKR', status: pick(['succeeded', 'succeeded', 'pending']), items: item ? [{ listingId: item._id, listingTitle: item.listingTitle, quantity: 1, unitPrice: item.price.amount, subtotal: item.price.amount }] : [], paidAt: pastDate(randInt(1, 30)) });
    }
    console.log('Created 10 payments\n');
  }

  const donationsCount = await Donation.countDocuments();
  if (donationsCount < 3) {
    console.log('Creating donations...');
    for (let i = 0; i < 8; i++) {
      await Donation.create({ donor: { fullName: `Donor ${String.fromCharCode(65 + i)}`, email: `donor${String.fromCharCode(65 + i).toLowerCase()}@example.com`, phone: `077${randInt(1000000, 9999999)}`, country: pick(['Sri Lanka', 'USA', 'UK', 'Australia']), isAnonymous: randInt(0, 1) === 0 }, amount: randInt(500, 50000), currency: 'LKR', purpose: pick(['general', 'artist-support', 'preservation', 'education']), allocatedProvince: pick([...PROVINCES, 'All Provinces']), paymentMethod: pick(['card', 'bank-transfer', 'mobile-payment']), paymentStatus: pick(['completed', 'completed', 'completed', 'pending']), message: pick(['Keep up the great work!', 'Happy to support folk art preservation.', 'Love Sri Lankan culture!', 'For the future generations.', '']), paidAt: pastDate(randInt(1, 90)), receiptSent: randInt(0, 1) === 1 });
    }
    console.log('Created 8 donations\n');
  }

  const allAdminUsers = await User.find({ role: 'admin' });
  const organizer = allAdminUsers.length > 0 ? allAdminUsers[0]._id : (users.length > 0 ? users[0]._id : null);

  const eventsCount = await Event.countDocuments();
  if (eventsCount < 3) {
    console.log('Creating events...');
    const eventData = [
      { title: 'Colombo Folk Art Festival 2026', eventType: 'Festival', province: 'Western', venue: 'Viharamahadevi Park', description: 'Annual celebration of Sri Lankan folk arts featuring live performances, exhibitions, and workshops.', startDate: futureDate(15), endDate: futureDate(17), status: 'upcoming', capacity: 500 },
      { title: 'Batik Making Workshop', eventType: 'Workshop', province: 'Southern', venue: 'Galle Fort Art Gallery', description: 'Hands-on workshop learning traditional batik techniques from master artisans.', startDate: futureDate(30), endDate: futureDate(30), status: 'upcoming', capacity: 25 },
      { title: 'Kandyan Dance & Music Exhibition', eventType: 'Exhibition', province: 'Central', venue: 'Kandy Cultural Centre', description: 'Exhibition showcasing traditional Kandyan dance costumes, drums, and musical instruments.', startDate: pastDate(10), endDate: pastDate(5), status: 'completed', capacity: 200 },
      { title: 'Traditional Puppetry Training Program', eventType: 'Training', province: 'Southern', venue: 'Ambalangoda Puppet Museum', description: 'Week-long training program on string puppet making and performance.', startDate: futureDate(45), endDate: futureDate(52), status: 'upcoming', capacity: 15 },
      { title: 'National Folk Art Competition', eventType: 'Competition', province: 'Western', venue: 'Bandaranaike Memorial International Conference Hall', description: 'National level competition for folk artists across all provinces.', startDate: futureDate(60), endDate: futureDate(62), status: 'upcoming', capacity: 300 },
    ];
    for (const e of eventData) {
      await Event.create({ ...e, location: { venue: e.venue, address: e.venue + ', ' + e.province, district: e.province }, startTime: '09:00', endTime: '17:00', organizer, categories: pickN(SPEC, 3), fees: { amount: e.eventType === 'Festival' ? 500 : 0, currency: 'LKR' }, isPublished: true, contactInfo: { email: 'events@folkfusion.lk', phone: '0112345678' } });
    }
    console.log('Created 5 events\n');
  }

  const coursesCount = await Course.countDocuments();
  if (coursesCount < 3) {
    console.log('Creating courses...');
    const admins = await User.find({ role: 'admin' });
    const adminProfile = await require('../models/Admin').findOne({});
    const createdBy = adminProfile ? adminProfile._id : undefined;
    const courseData = [
      { title: 'Introduction to Batik Art', artForm: 'Batik Clothing', level: 'Beginner', weeks: 4, hoursPerWeek: 6, fee: 5000, province: 'Western', historicalPlace: 'Colombo National Museum', city: 'Colombo' },
      { title: 'Advanced Wood Carving Techniques', artForm: 'Wood Carving', level: 'Advanced', weeks: 8, hoursPerWeek: 10, fee: 15000, province: 'Central', historicalPlace: 'Temple of the Tooth', city: 'Kandy' },
      { title: 'Traditional Mask Making', artForm: 'Traditional Masks', level: 'Intermediate', weeks: 6, hoursPerWeek: 8, fee: 8000, province: 'Southern', historicalPlace: 'Ambalangoda Mask Museum', city: 'Ambalangoda' },
      { title: 'Beeralu Lace Workshop', artForm: 'Beeralu Lace', level: 'Beginner', weeks: 3, hoursPerWeek: 4, fee: 3000, province: 'Southern', historicalPlace: 'Galle Fort', city: 'Galle' },
      { title: 'Pottery & Ceramic Art', artForm: 'Pottery & Clay', level: 'All Levels', weeks: 5, hoursPerWeek: 6, fee: 6000, province: 'North Central', historicalPlace: 'Anuradhapura Archaeological Museum', city: 'Anuradhapura' },
    ];
    for (const c of courseData) {
      await Course.create({ title: c.title, description: `Learn the traditional art of ${c.artForm} in this comprehensive course.`, province: c.province, historicalPlace: { name: c.historicalPlace, address: c.historicalPlace, city: c.city, coordinates: { latitude: 7.0 + Math.random(), longitude: 80.0 + Math.random() } }, artForm: c.artForm, level: c.level, duration: { weeks: c.weeks, hoursPerWeek: c.hoursPerWeek }, schedule: { days: ['Monday', 'Wednesday', 'Friday'], time: { start: '09:00', end: '12:00' } }, capacity: { minimum: 5, maximum: 20 }, fee: { amount: c.fee, currency: 'LKR', paymentSchedule: 'One-time' }, instructor: { name: pick(ARTIST_DATA).name, bio: 'Master craftsman with over 15 years of teaching experience.', qualifications: ['National Arts Council Certified', 'University of Visual Arts'] }, prerequisites: ['No prior experience required'], status: 'active', startDate: futureDate(14), registrationDeadline: futureDate(10), certification: { provided: true, details: 'FolkFusion Certificate of Completion' }, languageOfInstruction: 'Bilingual', contactPerson: { name: 'Course Admin', phone: '0112345678', email: 'courses@folkfusion.lk' }, createdBy, views: randInt(50, 500), inquiries: randInt(2, 20), isFeatured: randInt(0, 2) === 0 });
    }
    console.log('Created 5 courses\n');
  }

  const newsCount = await News.countDocuments();
  if (newsCount < 3) {
    console.log('Creating news...');
    const newsData = [
      { title: 'FolkFusion Platform Launches to Preserve Sri Lankan Folk Art', excerpt: 'New digital platform aims to connect folk artists with global audiences.', description: 'FolkFusion, a revolutionary digital platform dedicated to preserving and promoting Sri Lankan folk art, has officially launched. The platform provides artists with tools to showcase their work, connect with communities, and increase visibility for traditional cultural heritage. Built using modern technology, FolkFusion bridges the gap between traditional craftsmanship and digital audiences.', category: 'Announcement', province: 'All Provinces', isFeatured: true },
      { title: 'National Batik Exhibition Draws Record Attendance', excerpt: 'Over 5,000 visitors attended the three-day exhibition in Colombo.', description: 'The National Batik Exhibition, organized in collaboration with FolkFusion, attracted over 5,000 visitors over three days at the Colombo Art Gallery. The event featured 200+ artworks from batik artists across all nine provinces. Attendees had the opportunity to watch live demonstrations and purchase artworks directly from artists.', category: 'Exhibition', province: 'Western', isFeatured: true },
      { title: 'Traditional Wood Carving Gains UNESCO Recognition', excerpt: 'Sri Lankan wood carving artform receives international acknowledgment.', description: 'The traditional wood carving techniques of Sri Lanka have been recognized by UNESCO as an Intangible Cultural Heritage. This recognition highlights the importance of preserving these ancient skills. FolkFusion artists from Kandy were among the first to be acknowledged for their contributions to this art form.', category: 'Achievement', province: 'Central' },
      { title: 'New Workshop Series: Learn Rabana Making', excerpt: 'Sign up for hands-on rabana drum making workshops starting next month.', description: 'FolkFusion is launching a new series of workshops focused on traditional rabana drum making. These hands-on sessions will be led by master craftsman Priya Jayawardena and will cover everything from selecting the right wood to finishing techniques. Limited spots available.', category: 'Workshop', province: 'Sabaragamuwa' },
      { title: 'Monthly Folk Art Training Program Expands to Northern Province', excerpt: 'Free training programs now available in Jaffna and Kilinochchi.', description: 'The FolkFusion monthly training program has expanded its reach to the Northern Province. New training centers have been established in Jaffna and Kilinochchi, offering free workshops in pottery, weaving, and other traditional crafts. This expansion aims to support post-war cultural revival.', category: 'Training Program', province: 'Northern' },
    ];
    for (const n of newsData) {
      await News.create({ ...n, images: [`${PLACEHOLDER_IMG}${encodeURIComponent(n.title)}`], date: pastDate(randInt(1, 60)), location: n.province + ', Sri Lanka', createdBy: organizer, isPublished: true, views: randInt(100, 2000) });
    }
    console.log('Created 5 news articles\n');
  }

  const reviewsCount = await Review.countDocuments();
  if (reviewsCount < 3) {
    console.log('Creating reviews...');
    const reviewData = [
      { userName: 'Nimal Fernando', email: 'nimal@example.com', category: 'Artworks', rating: 5, comment: 'Amazing collection of traditional Sri Lankan art. The quality of craftsmanship is outstanding.' },
      { userName: 'Sarah Williams', email: 'sarah@example.com', category: 'Platform', rating: 4, comment: 'Great platform for discovering folk art. Would love to see more international shipping options.' },
      { userName: 'Kamal Jayasuriya', email: 'kamal@example.com', category: 'Artists', rating: 5, comment: 'FolkFusion has given our village artists a voice. Thank you for this initiative!' },
      { userName: 'Anjali Perera', email: 'anjali@example.com', category: 'Events', rating: 4, comment: 'The Colombo Folk Art Festival was wonderful. Great organization and amazing art.' },
      { userName: 'David Chen', email: 'david@example.com', category: 'Platform', rating: 5, comment: 'As a collector of folk art, this platform is a goldmine. Authentic pieces from talented artists.' },
    ];
    for (const r of reviewData) {
      await Review.create({ ...r, status: 'approved' });
    }
    console.log('Created 5 reviews\n');
  }

  const inquiriesCount = await Inquiry.countDocuments();
  if (inquiriesCount < 3) {
    console.log('Creating inquiries...');
    const inqData = [
      { name: 'Lakshmi Devi', email: 'lakshmi@example.com', province: 'Central', message: 'I would like to inquire about the batik workshop schedule for next month.', status: 'new' },
      { name: 'James Morrison', email: 'james@example.com', province: 'Western', message: 'Do you ship traditional masks internationally? I am based in Australia.', status: 'replied' },
      { name: 'Anura Kumara', email: 'anura@example.com', province: 'Southern', message: 'How can I register as an artist on the platform? I am a traditional puppet maker.', status: 'new' },
    ];
    for (const i of inqData) {
      await Inquiry.create({ ...i, contactNo: `077${randInt(1000000, 9999999)}`, address: '', userType: pick(['public', 'artist']), adminNote: '', repliedAt: i.status === 'replied' ? pastDate(2) : null });
    }
    console.log('Created 3 inquiries\n');
  }

  const notificationsCount = await Notification.countDocuments();
  if (notificationsCount < 3) {
    console.log('Creating notifications...');
    const allUsers = await User.find();
    for (let i = 0; i < 10; i++) {
      const recip = pick(allUsers);
      await Notification.create({ recipient: recip._id, recipientRole: recip.role, province: recip.province || 'Western', type: pick(['ARTWORK_ADDED', 'MARKETPLACE_SALE', 'DONATION_RECEIVED', 'INQUIRY_RECEIVED', 'EVENT_ADDED']), title: pick(['New artwork added', 'Sale completed', 'Donation received', 'New inquiry', 'New event posted']), message: pick(['A new artwork has been added to the marketplace.', 'A sale has been completed successfully.', 'A donation has been received.', 'A new inquiry has been received.', 'A new event has been posted.']), isRead: randInt(0, 1) === 1 });
    }
    console.log('Created 10 notifications\n');
  }

  const histCount = await HistoricalPlace.countDocuments();
  if (histCount < 3) {
    console.log('Creating historical places...');
    const histData = [
      { name: 'Temple of the Tooth Relic', province: 'Central', district: 'Kandy', city: 'Kandy', location: 'Kandy', artType: 'Kandyan Art & Architecture', description: 'Sacred Buddhist temple housing the tooth relic of the Buddha, featuring exquisite Kandyan-era artwork and architecture.', culturalImportance: 'One of the most sacred Buddhist temples in Sri Lanka, a UNESCO World Heritage Site.', history: 'Built in the 16th century, the temple has been a center of Kandyan art and culture for centuries.' },
      { name: 'Ambalangoda Mask Museum', province: 'Southern', district: 'Galle', city: 'Ambalangoda', location: 'Ambalangoda', artType: 'Traditional Masks', description: 'Museum and workshop dedicated to the preservation of traditional Sri Lankan mask carving.', culturalImportance: 'Ambalangoda is the traditional center of mask making in Sri Lanka, with families passing down the craft for generations.', history: 'Mask making in Ambalangoda dates back to the 17th century when masks were used in ritualistic dances and healing ceremonies.' },
      { name: 'Galle Fort', province: 'Southern', district: 'Galle', city: 'Galle', location: 'Galle', artType: 'Colonial Architecture & Beeralu Lace', description: 'Historic fort showcasing Portuguese, Dutch, and British colonial architecture alongside traditional Beeralu lace making.', culturalImportance: 'UNESCO World Heritage Site that preserves both colonial and traditional Sri Lankan cultural elements.', history: 'Originally built by the Portuguese in 1588 and fortified by the Dutch in the 17th century.' },
      { name: 'Anuradhapura Sacred City', province: 'North Central', district: 'Anuradhapura', city: 'Anuradhapura', location: 'Anuradhapura', artType: 'Ancient Sculpture & Architecture', description: 'Ancient city ruins showcasing over 1,000 years of Sinhalese art, architecture, and civilization.', culturalImportance: 'Cradle of Sinhalese civilization with ancient stupas, palaces, and monasteries.', history: 'Capital of Sri Lanka from the 4th century BCE to the 11th century CE.' },
      { name: 'Jaffna Cultural Centre', province: 'Northern', district: 'Jaffna', city: 'Jaffna', location: 'Jaffna', artType: 'Tamil Folk Arts', description: 'Modern cultural center preserving and showcasing Tamil folk art traditions of the Northern Province.', culturalImportance: 'Important center for post-war cultural revival and Tamil artistic expression.', history: 'Established in the post-war era to preserve and promote Northern Province cultural traditions.' },
    ];
    for (const h of histData) {
      await HistoricalPlace.create({ ...h, images: [`${PLACEHOLDER_IMG}${encodeURIComponent(h.name)}`], facilities: ['Parking', 'Guided Tours', 'Gift Shop'], nearbyAttractions: ['Local Restaurants', 'Artisan Shops'], status: 'active' });
    }
    console.log('Created 5 historical places\n');
  }

  const learningContentCount = await LearningContent.countDocuments();
  if (learningContentCount < 3) {
    console.log('Seeding learning content...');
    const ART_CATEGORIES = [
      'Batik Clothing', 'Handloom Saree', 'Folk Jewelry', 'Ceramic', 'Statues',
      'Sri Lankan Sculpture', 'Wood Carving', 'Cane Work', 'Mats', 'Hana Fiber Crafts',
      'Coconut Crafts', 'Metal Craft', 'Lacquer Work', 'Folk Mural Painting', 'Puppetry',
      'Drum Craft', 'Rabana Making', 'Traditional Masks', 'Beeralu Lace', 'Sesath Craft',
      'Palm Leaf Craft', 'Ola Leaf Manuscripts', 'Calabash Art', 'Traditional Toy Making',
      'Horn Craft', 'Gem & Traditional Jewelry Craft', 'Pottery & Clay', 'Other',
    ];
    let created = 0;
    for (const category of ART_CATEGORIES) {
      const exists = await LearningContent.findOne({ category });
      if (!exists) {
        await LearningContent.create({ category });
        created++;
      }
    }
    console.log(`Created ${created} learning content categories\n`);
  }

  const traditionalPatternsCount = await TraditionalPattern.countDocuments();
  if (traditionalPatternsCount < 3) {
    console.log('Creating traditional patterns...');
    const patData = [
      { title: 'Liya Vela (Creeper Pattern)', description: 'Traditional Sinhalese creeper motif used in temple decorations and woodwork.', order: 1 },
      { title: 'Makara Torana (Dragon Arch)', description: 'Ornamental dragon arch found at entrances of Buddhist temples.', order: 2 },
      { title: 'Lotus Petal Border', description: 'Repeating lotus petal pattern used in traditional textile and ceramic designs.', order: 3 },
      { title: 'Hansa (Sacred Swan)', description: 'Mythical swan motif symbolizing purity, commonly found in Kandyan art.', order: 4 },
      { title: 'Kirtimukha (Face of Glory)', description: 'Fierce face motif used as a protective symbol in temple architecture.', order: 5 },
    ];
    for (const p of patData) {
      await TraditionalPattern.create(p);
    }
    console.log('Created 5 traditional patterns\n');
  }

  const learningUsersCount = await LearningUser.countDocuments();
  if (learningUsersCount < 3) {
    console.log('Creating learning users...');
    const luData = [
      { name: 'Amasha Fernando', email: 'amasha@example.com', phone: '0771111111', province: 'Western', age: 22, userType: 'Student', progress: [{ category: 'Batik Clothing', completedChapters: [0, 1, 2], startedAt: pastDate(30) }] },
      { name: 'Suresh Kumar', email: 'suresh@example.com', phone: '0772222222', province: 'Central', age: 28, userType: 'Professional', progress: [{ category: 'Wood Carving', completedChapters: [0, 1], startedAt: pastDate(15) }, { category: 'Traditional Masks', completedChapters: [0], startedAt: pastDate(10) }] },
      { name: 'Romesh de Silva', email: 'romesh@example.com', phone: '0773333333', province: 'Southern', age: 19, userType: 'Undergraduate' },
    ];
    for (const lu of luData) {
      await LearningUser.create(lu);
    }
    console.log('Created 3 learning users\n');
  }

  const arCount = await ARArtwork.countDocuments();
  if (arCount < 3) {
    console.log('Creating AR artworks...');
    const arData = [
      { title: 'Kandyan Dancer AR Experience', description: 'Interactive 3D model of a traditional Kandyan dancer.', category: 'Traditional Dance', isPublished: true, order: 1 },
      { title: 'Ancient Pottery Wheel AR', description: 'Virtual pottery wheel demonstration using AR technology.', category: 'Pottery', isPublished: true, order: 2 },
      { title: 'Sri Lankan Mask Gallery AR', description: 'Virtual gallery of traditional masks viewable in AR.', category: 'Masks', isPublished: false, order: 3 },
    ];
    for (const ar of arData) {
      await ARArtwork.create({ ...ar, image: `${PLACEHOLDER_IMG}${encodeURIComponent(ar.title)}`, glbModel: '' });
    }
    console.log('Created 3 AR artworks\n');
  }

  console.log('=== SEED COMPLETE ===');
  const counts = {
    Users: await User.countDocuments(), Artists: await Artist.countDocuments(), Artworks: await Artwork.countDocuments(),
    MarketplaceItems: await MarketplaceItem.countDocuments(), Sales: await Sale.countDocuments(), Payments: await Payment.countDocuments(),
    Donations: await Donation.countDocuments(), Events: await Event.countDocuments(), Courses: await Course.countDocuments(),
    News: await News.countDocuments(), Reviews: await Review.countDocuments(), Inquiries: await Inquiry.countDocuments(),
    Notifications: await Notification.countDocuments(), HistoricalPlaces: await HistoricalPlace.countDocuments(),
    LearningContent: await LearningContent.countDocuments(), TraditionalPatterns: await TraditionalPattern.countDocuments(),
    LearningUsers: await LearningUser.countDocuments(), ARArtworks: await ARArtwork.countDocuments(),
  };
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('SEED ERROR:', err); process.exit(1); });
