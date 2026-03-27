const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/User');
const { getJwtSecret } = require('./config/jwt');

// Load env vars
dotenv.config();

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

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport Strategies
require('./config/passport');
app.use(passport.initialize());

// Routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const inventoryRoutes = require('./routes/inventory');
const mediaRoutes = require('./routes/media');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Talé API Service is running...');
});

// Database connection & Server initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tale';

mongoose.connect(MONGO_URI)
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

    app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
  })
  .catch(err => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  });

// Automatic configuration re-hydration trigger

// Hotkey reload injection

// Cloudinary Sync
