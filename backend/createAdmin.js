const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tale';
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;

const seedAdmin = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env before running createAdmin.js.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      existingAdmin.role = 'Admin';
      existingAdmin.password = ADMIN_PASSWORD;
      await existingAdmin.save();
      console.log('\n[TALÉ] Existing user promoted to Admin.');
    } else {
      await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: process.env.ADMIN_SEED_NAME || 'Talé Administrator',
        role: 'Admin',
      });
      console.log('\n[TALÉ] New admin user created.');
    }

    console.log('\n--- Admin CLI ---');
    console.log('Open: http://localhost:3000/admin');
    console.log('Email:', ADMIN_EMAIL);
    console.log('(password from ADMIN_SEED_PASSWORD)\n');

    process.exit(0);
  } catch (err) {
    console.error('[CRITICAL DB FAILURE]', err);
    process.exit(1);
  }
};

seedAdmin();
