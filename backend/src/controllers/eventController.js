const Event  = require('../models/Event');
const Artist = require('../models/Artist');
const User   = require('../models/User');
const { createNotification } = require('../services/notificationHelper');

exports.getEvents = async (req, res) => {
  try {
    const { province, eventType, status, upcoming, search, page = 1, limit = 12, sort = 'startDate' } = req.query;
    let query = { isPublished: true };
    if (province && province !== 'all') query.province = province;
    if (eventType) query.eventType = eventType;
    if (status)    query.status    = status;
    if (upcoming === 'true') { query.startDate = { $gte: new Date() }; query.status = 'upcoming'; }
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    const events = await Event.find(query).populate('organizer', 'email province').sort(sort).limit(limit * 1).skip((page - 1) * limit).select('-participants');
    for (const event of events) { event.updateStatus(); await event.save(); }
    const count = await Event.countDocuments(query);
    res.status(200).json({ success: true, count: events.length, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Events fetch error', error: error.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'email province').populate('participants.artist', 'fullName profileImage province specialization');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.updateStatus(); await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Event fetch error', error: error.message });
  }
};

// event added notifies all artists in the same province
exports.createEvent = async (req, res) => {
  try {
    const { title, description, eventType, location, startDate, endDate, startTime, endTime, categories, capacity, registrationDeadline, fees, contactInfo } = req.body;
    const parsedLocation    = typeof location    === 'string' ? JSON.parse(location)    : location;
    const parsedFees        = typeof fees        === 'string' ? JSON.parse(fees)        : fees;
    const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
    if (new Date(startDate) >= new Date(endDate)) return res.status(400).json({ success: false, message: 'End date must be after start date' });

    let coverImage = {};
    if (req.file) coverImage = { url: req.file.path, publicId: req.file.filename };

    const event = await Event.create({
      title, description, eventType, province: req.user.province, location: parsedLocation, startDate, endDate, startTime, endTime, coverImage, organizer: req.user._id,
      categories: categories ? categories.split(',').map(c => c.trim()) : [], capacity: capacity || 0,
      registrationDeadline, fees: parsedFees, contactInfo: parsedContactInfo,
      status: new Date(startDate) > new Date() ? 'upcoming' : 'ongoing',
    });

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'email province');

    // Notify all artists in this province about the new event
    const io             = req.app.get('io');
    const provinceArtistUsers = await User.find({ role: 'artist', province: req.user.province });
    provinceArtistUsers.forEach(artistUser => {
      createNotification(io, {
        recipientUserId: artistUser._id.toString(),
        recipientRole:   'artist',
        province:        req.user.province,
        type:            'EVENT_ADDED',
        title:           'New Event in Your Province!',
        message:         `A new event "${title}" has been added to ${req.user.province} Province.`,
        data: { eventId: event._id },
      });
    });

    res.status(201).json({ success: true, message: 'Event created successfully', data: populatedEvent });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const isOrganizer    = event.organizer.toString() === req.user._id.toString();
    const isProvinceAdmin = req.user.role === 'admin' && event.province === req.user.province;
    if (!isOrganizer && !isProvinceAdmin) return res.status(403).json({ success: false, message: 'You do not have permission to modify this event' });
    const allowedUpdates = ['title','description','eventType','location','startDate','endDate','startTime','endTime','categories','capacity','registrationDeadline','fees','contactInfo','isPublished','participants'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'categories' && typeof req.body[field] === 'string') event[field] = req.body[field].split(',').map(c => c.trim());
        else event[field] = req.body[field];
      }
    });
    event.updateStatus(); await event.save();
    res.status(200).json({ success: true, message: 'Event updated successfully', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const isOrganizer     = event.organizer.toString() === req.user._id.toString();
    const isProvinceAdmin = req.user.role === 'admin' && event.province === req.user.province;
    if (!isOrganizer && !isProvinceAdmin) return res.status(403).json({ success: false, message: 'You do not have permission to delete this event' });
    if (event.coverImage?.publicId) { const { deleteImage } = require('../config/cloudinary'); await deleteImage(event.coverImage.publicId); }
    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    if (event.capacity > 0 && event.participants.length >= event.capacity) return res.status(400).json({ success: false, message: 'No more spots available for this event' });
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist profile not found' });
    const alreadyRegistered = event.participants.some(p => p.artist.toString() === artist._id.toString());
    if (alreadyRegistered) return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    event.participants.push({ artist: artist._id, registeredAt: Date.now(), status: 'registered' });
    await event.save();
    res.status(200).json({ success: true, message: 'Successfully registered for the event', data: { eventTitle: event.title, startDate: event.startDate } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering for event', error: error.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const artist = await Artist.findOne({ user: req.user._id });
    const participantIndex = event.participants.findIndex(p => p.artist.toString() === artist._id.toString());
    if (participantIndex === -1) return res.status(404).json({ success: false, message: 'You are not registered for this event' });
    event.participants[participantIndex].status = 'cancelled';
    await event.save();
    res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling registration', error: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist profile not found' });
    const events = await Event.find({ 'participants.artist': artist._id, 'participants.status': 'registered' }).populate('organizer', 'email province').sort('startDate');
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

exports.getProvinceEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = { province: req.user.province };
    if (status) query.status = status;
    const events = await Event.find(query).populate('organizer', 'email').sort('-createdAt').limit(limit * 1).skip((page - 1) * limit);
    const count  = await Event.countDocuments(query);
    const allEvents = await Event.find({ province: req.user.province });
    const stats = { total: allEvents.length, byStatus: { upcoming: allEvents.filter(e => e.status === 'upcoming').length, ongoing: allEvents.filter(e => e.status === 'ongoing').length, completed: allEvents.filter(e => e.status === 'completed').length, cancelled: allEvents.filter(e => e.status === 'cancelled').length }, totalParticipants: allEvents.reduce((sum, e) => sum + e.participants.length, 0) };
    res.status(200).json({ success: true, count: events.length, total: count, stats, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const events = await Event.find({ province: req.user.province });
    const stats = { total: events.length, byStatus: { upcoming: events.filter(e => e.status === 'upcoming').length, ongoing: events.filter(e => e.status === 'ongoing').length, completed: events.filter(e => e.status === 'completed').length, cancelled: events.filter(e => e.status === 'cancelled').length }, byType: {}, totalParticipants: events.reduce((sum, e) => sum + e.participants.length, 0), averageParticipants: events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.participants.length, 0) / events.length) : 0 };
    events.forEach(event => { stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1; });
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};

