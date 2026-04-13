const Groq   = require('groq-sdk');
const Artist = require('../models/Artist');
const Event  = require('../models/Event');
const MarketplaceItem = require('../models/MarketplaceItem');
const Course = require('../models/Course');
const News   = require('../models/News');
const { LearningContent } = require('../models/LearningContent');
const HistoricalPlace     = require('../models/Historicalplace');
const crypto = require('crypto');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* session store(in-memory, 2hr)*/
const sessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}, 30 * 60 * 1000);

const getOrCreateSession = (sessionId, name, contact) => {
  if (sessionId && sessions.has(sessionId)) {
    const s = sessions.get(sessionId);
    if (name)    s.name    = name;
    if (contact) s.contact = contact;
    return { session: s, sessionId, isNew: false };
  }
  const newId   = crypto.randomUUID();
  const session = { name: name || null, contact: contact || null, history: [], createdAt: Date.now() };
  sessions.set(newId, session);
  return { session, sessionId: newId, isNew: true };
};

/* fetch all live data */
const fetchPlatformData = async () => {
  try {
    const [artists, events, marketItems, courses, news, learningContent, historicalPlaces] = await Promise.all([

      // Artists
      Artist.find({})
        .select('fullName specialization bio profilePhoto profileImage isFeatured yearsOfExperience')
        .populate('user', 'province isApproved isActive')
        .limit(20).lean(),

      // Events
      Event.find({ isPublished: true, status: { $in: ['upcoming', 'ongoing'] } })
        .select('title description eventType province location startDate endDate coverImage status fees')
        .sort({ startDate: 1 }).limit(10).lean(),

      // Marketplace 
      MarketplaceItem.find({ status: 'active', isApproved: true })
        .select('listingTitle description price province status isFeatured artist artwork shipping')
        .populate('artwork', 'images category')
        .populate('artist', 'fullName')
        .limit(15).lean(),

      // Courses 
      Course.find({ status: { $in: ['active', 'upcoming', 'ongoing'] } })
        .select('title description level fee artForm province status startDate registrationDeadline images instructor capacity enrolledStudents contactPerson languageOfInstruction certification')
        .limit(10).lean(),

      // News 
      News.find({ isPublished: true })
        .select('title excerpt category province images date')
        .sort({ date: -1 }).limit(5).lean(),

      // Learning Content
      LearningContent.find({ isPublished: true })
        .select('category description coverImage')
        .limit(20).lean(),

      // Historical Places 
      HistoricalPlace.find({ status: 'active' })
        .select('name province district city artType description images')
        .limit(10).lean(),
    ]);

    return { artists, events, marketItems, courses, news, learningContent, historicalPlaces };
  } catch (err) {
    console.error('[Chat] Data fetch error:', err.message);
    return { artists: [], events: [], marketItems: [], courses: [], news: [], learningContent: [], historicalPlaces: [] };
  }
};

/*build system promt*/
const buildSystemPrompt = (data, session, baseUrl) => {
  const { artists, events, marketItems, courses, news, learningContent, historicalPlaces } = data;

  /*Artists*/
  const artistList = artists.length
    ? artists.map(a => {
        const province = a.user?.province || 'Unknown';
        const photo    = a.profileImage?.url || a.profilePhoto || null;
        return [
          `• **${a.fullName}** — ${province}`,
          `  Specializes in: ${a.specialization?.join(', ') || 'Folk Art'}`,
          a.yearsOfExperience ? `  Experience: ${a.yearsOfExperience} years` : '',
          a.bio ? `  Bio: ${a.bio.slice(0, 120)}` : '',
          photo ? `  Photo: ${photo}` : '',
          `  Link: ${baseUrl}/artists`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No artists registered yet.';

  /* events*/
  const eventList = events.length
    ? events.map(e => {
        const cover = e.coverImage?.url || null;
        const date  = e.startDate ? new Date(e.startDate).toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' }) : 'TBD';
        const fee   = e.fees?.amount > 0 ? `LKR ${e.fees.amount.toLocaleString()}` : 'Free';
        return [
          `• **${e.title}** [${e.status}]`,
          `  Type: ${e.eventType} | Province: ${e.province} | Entry: ${fee}`,
          `  Date: ${date} | Venue: ${e.location?.venue || 'TBD'}, ${e.location?.address || ''}`,
          e.description ? `  ${e.description.slice(0, 150)}` : '',
          cover ? `  Cover: ${cover}` : '',
          `  Link: ${baseUrl}/events`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No upcoming events.';

  /* marketplace */
  const marketList = marketItems.length
    ? marketItems.map(i => {
        const img   = i.artwork?.images?.[0]?.url || null;
        const price = i.price?.amount ? `LKR ${i.price.amount.toLocaleString()}` : 'Price on request';
        const ship  = i.shipping?.available ? `Shipping available (LKR ${i.shipping.cost || 0})` : 'Pickup only';
        return [
          `• **${i.listingTitle}** — ${price}`,
          `  Category: ${i.artwork?.category || 'Craft'} | Province: ${i.province}`,
          `  Artist: ${i.artist?.fullName || 'Unknown'} | ${ship}`,
          i.description ? `  ${i.description.slice(0, 120)}` : '',
          img ? `  Image: ${img}` : '',
          `  Link: ${baseUrl}/marketplace`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No marketplace items available right now.';

  /*courses */
  const courseList = courses.length
    ? courses.map(c => {
        const fee      = c.fee?.amount ? `LKR ${c.fee.amount.toLocaleString()} (${c.fee.paymentSchedule || 'One-time'})` : 'Free';
        const img      = c.images?.[0] || null;
        const start    = c.startDate ? new Date(c.startDate).toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' }) : 'TBD';
        const deadline = c.registrationDeadline ? new Date(c.registrationDeadline).toLocaleDateString('en-LK') : 'TBD';
        const spots    = c.capacity?.maximum ? `${c.capacity.maximum - (c.enrolledStudents || 0)} spots left` : 'Open enrollment';
        return [
          `• **${c.title}** [${c.level}] — ${fee}`,
          `  Art Form: ${c.artForm} | Province: ${c.province} | Language: ${c.languageOfInstruction || 'Sinhala'}`,
          `  Status: ${c.status} | Starts: ${start} | Register by: ${deadline}`,
          `  Instructor: ${c.instructor?.name || 'TBD'} | ${spots}`,
          c.certification?.provided ? `  Certificate: Yes — ${c.certification.details || ''}` : '',
          c.contactPerson?.phone ? `  Contact: ${c.contactPerson.name || ''} — ${c.contactPerson.phone}` : '',
          c.contactPerson?.whatsapp ? `  WhatsApp: ${c.contactPerson.whatsapp}` : '',
          c.description ? `  ${c.description.slice(0, 120)}` : '',
          img ? `  Image: ${img}` : '',
          `  Link: ${baseUrl}/courses`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No active courses at the moment.';

  /* news*/
  const newsList = news.length
    ? news.map(n => {
        const img  = n.images?.[0] || null;
        const date = n.date ? new Date(n.date).toLocaleDateString('en-LK') : '';
        return [
          `• **${n.title}** [${n.category}]`,
          `  Province: ${n.province} | Date: ${date}`,
          n.excerpt ? `  ${n.excerpt}` : '',
          img ? `  Image: ${img}` : '',
          `  Link: ${baseUrl}/news`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No recent news.';

  /*Learning Content*/
  const learningList = learningContent.length
    ? learningContent.map(l => {
        return [
          `• **${l.category}**`,
          l.description ? `  ${l.description.slice(0, 120)}` : '',
          l.coverImage ? `  Cover: ${l.coverImage}` : '',
          `  Link: ${baseUrl}/learning`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No learning content published yet.';

  /*historical Places*/
  const placesList = historicalPlaces.length
    ? historicalPlaces.map(p => {
        const img = p.images?.[0] || null;
        return [
          `• **${p.name}** — ${p.province}`,
          `  District: ${p.district} | City: ${p.city} | Art Type: ${p.artType}`,
          p.description ? `  ${p.description.slice(0, 120)}` : '',
          img ? `  Image: ${img}` : '',
          `  Link: ${baseUrl}/historical-places`,
        ].filter(Boolean).join('\n');
      }).join('\n\n')
    : 'No historical places listed yet.';

  /*User context*/
  const userCtx = session.name
    ? `\n## Current User\nName: ${session.name}${session.contact ? ` | Contact: ${session.contact}` : ''}\nAlways address them by name warmly.\n`
    : '';

  return `You are the **FolkFusion AI Assistant** — a professional, warm and knowledgeable assistant for FolkFusion, Sri Lanka's digital platform for preserving and promoting folk art.

You know EVERYTHING about this platform. For any question a user asks, give a clear, helpful, step-by-step answer. Never say "I don't know" if the answer is in this prompt.
${userCtx}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## WEBSITE PAGES & LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Home:               ${baseUrl}/
- Artists:            ${baseUrl}/artists
- Artworks/Gallery:   ${baseUrl}/artworks
- Marketplace:        ${baseUrl}/marketplace
- Events:             ${baseUrl}/events
- Courses:            ${baseUrl}/courses
- Historical Places:  ${baseUrl}/historical-places
- Learning Hub:       ${baseUrl}/learning
- News:               ${baseUrl}/news
- Donate:             ${baseUrl}/donate
- Contact/Inquiries:  ${baseUrl}/contact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: DONATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Anyone can donate to support Sri Lankan folk artists. No account required.

Steps to donate:
1. Go to ${baseUrl}/donate
2. Choose a donation purpose: General Support / Artist Support / Event Sponsorship / Cultural Preservation / Education
3. You can donate to a specific artist or for a specific event, or to all provinces generally
4. Enter your details (name, email, optional phone)
5. Choose amount (minimum LKR 100)
6. Pay securely via Stripe (card payment)
7. You will receive a receipt by email with a receipt number (e.g. DON-202504-00001)

Donation purposes available:
- **General** — supports the platform overall
- **Artist Support** — goes directly to a specific folk artist
- **Event Sponsorship** — supports a specific cultural event
- **Preservation** — funds cultural heritage preservation work
- **Education** — supports folk art education programs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: PARTNERSHIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FolkFusion welcomes partnerships with:
- Cultural organizations & NGOs
- Government departments
- Schools & universities
- Businesses wanting to support folk arts (CSR)
- Tourism companies & hotels
- Media partners

To inquire about a partnership:
1. Visit ${baseUrl}/contact
2. Submit an inquiry with your organization details and partnership proposal
3. Our team will respond within 2-3 business days

Provincial partners: Each province has a Provincial Traditional Industry Development Department that works with FolkFusion to register and manage artists.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: LEARNING CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Learning Hub at ${baseUrl}/learning is FREE for everyone — no login required.

What you can learn:
- History of each folk art category
- Techniques used by traditional artists
- Cultural significance of each art form
- Famous historical places related to that art
- Artworks & image galleries

How to access:
1. Go to ${baseUrl}/learning
2. Browse available art categories
3. Click any category to read chapters: Introduction → History → Techniques → Cultural Significance → Famous Places → Artworks & Images
4. No account needed — completely free and open

Available learning categories (from live data):
${learningList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: JOIN / ENROLL IN COURSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Courses are physical, in-person workshops and training programs run by Provincial Departments.

Steps to join a course:
1. Browse available courses at ${baseUrl}/courses
2. Find a course that suits you (filter by art form, province, level)
3. Check the registration deadline and available spots
4. Contact the course organizer directly using the contact details on the course page:
   - Phone or WhatsApp number of the contact person
   - Or submit an inquiry via ${baseUrl}/contact
5. Attend on the start date at the given historical venue location
6. Pay the course fee (if applicable) as instructed by the organizer
7. Complete the course to receive a certificate (if the course offers one)

Note: Some courses are free. Some offer certificates. Course language may be Sinhala, Tamil, English, or Bilingual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: BUY FROM MARKETPLACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to ${baseUrl}/marketplace
2. Browse items by category or province
3. Click any item to see full details, images and price
4. Click "Buy Now" or "Contact Artist" to purchase
5. Pay via Stripe (card) — shipping or pickup options available
6. You will receive an order confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: SUBMIT A REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Users can leave reviews/feedback about FolkFusion:
1. Go to ${baseUrl}/contact or the relevant artist/artwork page
2. Fill in your name, email, rating (1-5 stars) and comment
3. Select the category your feedback relates to
4. Submit — your review will be visible after approval by our team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: BECOME A REGISTERED ARTIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit your nearest Provincial Traditional Industry Development Department
2. Register as a folk artist with your specialization details
3. The department will create your FolkFusion account and provide login credentials
4. Login at ${baseUrl}/login
5. Complete your profile — add bio, photo, specialization, social media
6. Upload your artworks to the gallery
7. List items in the marketplace
8. Participate in events and courses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HOW TO: AR (Augmented Reality)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FolkFusion has 3D AR artworks viewable on mobile devices:
1. Open FolkFusion on your mobile browser
2. Go to the Artworks/Gallery section
3. Look for artworks with the AR badge
4. Tap "View in AR" to see the 3D model overlaid in your real environment
5. Works on Android and iOS devices with camera access

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## FOLK ART KNOWLEDGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Art categories: Batik Clothing, Handloom Saree, Folk Jewelry, Ceramic, Statues, Sri Lankan Sculpture, Wood Carving, Cane Work, Mats, Hana Fiber Crafts, Coconut Crafts, Metal Craft, Lacquer Work, Folk Mural Painting, Puppetry, Drum Craft, Rabana Making, Traditional Masks, Beeralu Lace, Sesath Craft, Palm Leaf Craft, Ola Leaf Manuscripts, Calabash Art, Traditional Toy Making, Horn Craft, Pottery & Clay

Province specialties:
- North Western: Pottery, mat weaving, batik
- Sabaragamuwa: Gem crafts, lacquer work
- Southern: Mask carving, stilt fishing crafts
- Central: Wood carving, kandyan crafts
- Western: Handloom, batik clothing
- Northern & Eastern: Traditional weaving, pottery

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## LIVE PLATFORM DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Artists (${artists.length} registered)
${artistList}

### Events (${events.length} upcoming/ongoing)
${eventList}

### Marketplace (${marketItems.length} active listings)
${marketList}

### Courses (${courses.length} available)
${courseList}

### News (${news.length} recent)
${newsList}

### Historical Places (${historicalPlaces.length})
${placesList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RESPONSE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Answer in the SAME language the user writes (Sinhala / Tamil / English)
2. For every platform item mentioned, include:
   - 🖼️ image URL if available
   - 🔗 page link
3. For HOW-TO questions (how to donate, enroll, buy, etc.) — give clear numbered steps
4. Never say "I don't know" for anything covered in this prompt
5. If truly not covered, direct to: ${baseUrl}/contact or suggest contacting the Provincial Department
6. Be friendly, warm, professional — like a real customer support agent
7. Use bullet points or numbered steps for clarity
8. Never invent data — only use LIVE DATA above for specific items`;
};

/* chat endpoints*/
exports.chat = async (req, res) => {
  try {
    const { sessionId, name, contact, message, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const result   = getOrCreateSession(sessionId, name, contact);
    const session  = result.session;
    const activeId = result.sessionId;

    session.history.push({ role: 'user', content: message || '' });
    if (session.history.length > 20) session.history = session.history.slice(-20);

    const platformData = await fetchPlatformData();
    const systemPrompt = buildSystemPrompt(platformData, session, baseUrl);

    let groqMessages = [{ role: 'system', content: systemPrompt }];

    if (image) {
      groqMessages = [
        ...groqMessages,
        ...session.history.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        {
          role: 'user',
          content: [
            { type: 'text', text: message || 'What can you tell me about this artwork?' },
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ];
    } else {
      groqMessages = [
        ...groqMessages,
        ...session.history.map(m => ({ role: m.role, content: m.content })),
      ];
    }

    const model = image ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model,
      messages:    groqMessages,
      max_tokens:  1500,
      temperature: 0.7,
      stream:      false,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    session.history.push({ role: 'assistant', content: reply });

    console.log(`[Chat] Session:${activeId} | User:${session.name || 'Anon'} | History:${session.history.length}`);

    res.json({ success: true, reply, sessionId: activeId });

  } catch (err) {
    console.error('[Chat] Error:', err.message);
    res.status(500).json({ success: false, message: 'Chat service temporarily unavailable. Please try again.' });
  }
};

exports.getSession = (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, name: session.name, contact: session.contact, messages: session.history.length });
};