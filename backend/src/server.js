const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const dotenv     = require('dotenv');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

dotenv.config();

const app    = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin.includes('.ngrok-free.dev') ||
        origin.includes('.ngrok-free.app') ||
        origin.includes('.ngrok.io') ||
        allowedOrigins.indexOf(origin) !== -1
      ) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods:     ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(` Socket connected: ${socket.id}`);
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`   ↳ User ${userId} joined room user_${userId}`);
    }
  });
  socket.on('disconnect', () => {
    console.log(` Socket disconnected: ${socket.id}`);
  });
});

// CORS — allow localhost & any ngrok URL
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow all ngrok URLs
    if (
      origin.includes('.ngrok-free.dev') ||
      origin.includes('.ngrok-free.app') ||
      origin.includes('.ngrok.io')
    ) return callback(null, true);
    // Allow local origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(' Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Static files(serve GLB models)
app.use('/models', express.static(path.join(__dirname, '../public/models')));

// Stripe webhook (must be before body parsers)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentController').handleWebhook
);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'FolkFusion Backend API is running',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth',               require('./routes/auth'));
app.use('/api/admin',              require('./routes/admin'));
app.use('/api/donations',          require('./routes/donations'));
app.use('/api/artists',            require('./routes/artists'));
app.use('/api/artworks',           require('./routes/artworks'));
app.use('/api/events',             require('./routes/events'));
app.use('/api/marketplace',        require('./routes/marketplace'));
app.use('/api/courses',            require('./routes/courses'));
app.use('/api/news',               require('./routes/news'));
app.use('/api/historical-places',  require('./routes/Historicalplaces'));
app.use('/api/inquiries',          require('./routes/inquiryRoutes'));
app.use('/api/payments',           require('./routes/payments'));
app.use('/api/notifications',      require('./routes/notifications'));
app.use('/api/learning',           require('./routes/learning'));
app.use('/api/ar-artworks',        require('./routes/arArtworkRoutes'));
app.use('/api/super-admin',        require('./routes/superAdmin'));

// test protected route
app.get('/api/test/protected', require('./middleware/auth').protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working!',
    user: {
      id:       req.user._id,
      email:    req.user.email,
      role:     req.user.role,
      province: req.user.province,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  if (err.type === 'entity.too.large')
    return res.status(413).json({ success: false, message: 'File too large. Maximum upload size is 50MB.' });
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === 'CastError')          return res.status(400).json({ success: false, message: 'Invalid ID' });
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ success: false, message: 'Invalid token' });
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ success: false, message: 'Token expired' });
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ success: false, message: 'File size too large' });
    return res.status(400).json({ success: false, message: 'File upload error' });
  }
  res.status(err.statusCode || 500).json({
    success:  false,
    message:  err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
       FOLKFUSION BACKEND API
      --------------------------------
      Server:      http://localhost:${PORT}
      Environment: ${process.env.NODE_ENV || 'development'}
      Database:    Connected
      Frontend:    http://localhost:5173
      Socket.IO:   Enabled
      Stripe:      ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}
      CORS:        Localhost + ngrok URLs allowed
      Upload:      50MB limit (images)
      GLB Models:  Served from /public/models
  `);
});

process.on('unhandledRejection', (err) => {
  const msg = err?.message || String(err) || '';
  const isCloudinaryError =
    err?.name === 'TimeoutError'        ||
    err?.name === 'AbortError'          ||
    err?.http_code === 499              ||
    err?.http_code === 400              ||
    msg.includes('File size too large') ||
    msg.includes('Request Timeout')     ||
    msg.includes('timeout')             ||
    msg.includes('Upgrade your plan')   ||
    msg.includes('cloudinary')          ||
    (typeof err === 'object' && err?.http_code !== undefined);
  if (isCloudinaryError) {
    console.log('[Non-fatal] Cloudinary error (server continues):', msg.split('\n')[0]);
    return;
  }
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err?.name || 'Unknown', err?.message || err);
  server.close(() => { process.exit(1); });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => { console.log('Process terminated!'); });
});

module.exports = app;