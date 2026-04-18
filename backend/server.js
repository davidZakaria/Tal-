const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const crypto = require('crypto');
const { getJwtSecret } = require('./config/jwt');

// Load env vars from backend/.env even if the process cwd is not the backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

if (process.env.NODE_ENV === 'production') {
  try {
    getJwtSecret();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  if (!process.env.CORS_ORIGIN) {
    console.error('CORS_ORIGIN must be set in production (comma-separated allowed origins).');
    process.exit(1);
  }
}

const app = express();

/**
 * Behind Nginx on the VPS the real client IP is in X-Forwarded-For. Trust a
 * single hop by default so `req.ip` and express-rate-limit work correctly.
 * Override with TRUST_PROXY=false to disable, or TRUST_PROXY=<number|cidr>.
 */
const trustProxy = (() => {
  const raw = process.env.TRUST_PROXY;
  if (raw === undefined || raw === '') return 1;
  if (raw === 'true') return 1;
  if (raw === 'false') return false;
  const asNumber = Number(raw);
  return Number.isFinite(asNumber) ? asNumber : raw;
})();
app.set('trust proxy', trustProxy);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(
  helmet({
    // The API never serves HTML to browsers directly (Next.js does), so the
    // default CSP would only cause noise. Leave other hardening headers on.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Lightweight health endpoint for Nginx / uptime monitors.
app.get('/healthz', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  res.status(dbState === 1 ? 200 : 503).json({
    ok: dbState === 1,
    db: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
    uptime: process.uptime(),
  });
});

// Initialize Passport Strategies
require('./config/passport');
app.use(passport.initialize());

// Return JSON (not HTML from the Next.js proxy) when the DB is not ready yet
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api') && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        'Database not connected. Check MONGO_URI in backend/.env and that MongoDB is reachable, then restart the API.',
    });
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const inventoryRoutes = require('./routes/inventory');
const mediaRoutes = require('./routes/media');
const paymentRoutes = require('./routes/payment');
const leadRoutes = require('./routes/leads');

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => {
  res.send('Talé API Service is running...');
});

// Database connection & Server initialization
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tale';
/** Listen address: 127.0.0.1 locally avoids IPv6/IPv4 confusion; use 0.0.0.0 in production if needed. */
const BIND_HOST = process.env.BIND_HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const mongooseOpts = {
  serverSelectionTimeoutMS: 15_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
  /** Prefer IPv4 on Windows so `localhost` / Atlas DNS issues are less likely. */
  family: 4,
};

function logMongoTarget(uri) {
  try {
    const u = new URL(uri);
    const db = u.pathname?.replace(/^\//, '') || '?';
    console.log(`[TALÉ] Connecting to MongoDB host="${u.hostname}" db="${db}"`);
  } catch {
    console.log('[TALÉ] MONGO_URI is set (could not parse for log)');
  }
}

logMongoTarget(MONGO_URI);

mongoose
  .connect(MONGO_URI, mongooseOpts)
  .then(async () => {
    console.log('MongoDB connected successfully.');

    // Dev-only bootstrap when ADMIN_BOOTSTRAP_EMAIL + ADMIN_BOOTSTRAP_PASSWORD are set (never in production)
    try {
      if (process.env.NODE_ENV !== 'production') {
        const adminCount = await User.countDocuments({ role: 'Admin' });
        const bootEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
        const bootPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
        if (adminCount === 0 && bootEmail && bootPassword) {
          await User.create({
            email: bootEmail,
            password: bootPassword,
            name: 'Talé Administrator',
            role: 'Admin',
          });
          console.log('[TALÉ] Dev bootstrap: admin user created from ADMIN_BOOTSTRAP_* env vars.');
        }
      }
    } catch (e) {
      console.log('[TALÉ] Admin bootstrap skipped:', e.message);
    }

    try {
      await Reservation.collection.updateMany(
        { status: 'Pending', paymentGatewayReference: { $nin: [null, ''] } },
        { $set: { status: 'ApprovedAwaitingPayment', paymentStatus: 'pending_gateway' } }
      );
      await Reservation.collection.updateMany(
        {
          status: 'Pending',
          $or: [
            { paymentGatewayReference: { $exists: false } },
            { paymentGatewayReference: null },
            { paymentGatewayReference: '' },
          ],
        },
        { $set: { status: 'PendingApproval', paymentStatus: 'unpaid' } }
      );
      await Reservation.collection.updateMany(
        { status: 'Confirmed' },
        { $set: { paymentStatus: 'paid' } }
      );
      const needsCode = await Reservation.find({
        $or: [{ bookingCode: { $exists: false } }, { bookingCode: null }, { bookingCode: '' }],
      })
        .select('_id')
        .lean();
      for (const row of needsCode) {
        let code;
        for (let i = 0; i < 12; i += 1) {
          code = `Talé-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          const clash = await Reservation.findOne({ bookingCode: code }).select('_id').lean();
          if (!clash) break;
        }
        if (code) await Reservation.collection.updateOne({ _id: row._id }, { $set: { bookingCode: code } });
      }
    } catch (e) {
      console.log('[TALÉ] Reservation migration skipped:', e.message);
    }
  })
  .catch((err) => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.error(
      '[TALÉ] Tips: use 127.0.0.1 instead of localhost in MONGO_URI on Windows; ensure MongoDB is running or Atlas IP allowlist + correct password (URL-encoded). API returns 503 for /api until connected.'
    );
  });

const server = app.listen(PORT, BIND_HOST, () => {
  console.log(
    `[TALÉ] API listening on http://${BIND_HOST}:${PORT} (${process.env.NODE_ENV || 'development'})`
  );
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[TALÉ] Port ${PORT} is already in use. Stop the other process (Task Manager / netstat) or set PORT=5001 in backend/.env`
    );
  } else {
    console.error('[TALÉ] HTTP server error:', err.message);
  }
  process.exit(1);
});

// Automatic configuration re-hydration trigger

// Hotkey reload injection

// Cloudinary Sync
