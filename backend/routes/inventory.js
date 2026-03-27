const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { sendConfirmationEmail } = require('../utils/emailService');
const Reservation = require('../models/Reservation');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/inventory/booked-dates/:propertyId
// @desc    Get an array of precise YYYY-MM-DD dates occupied by existing reservations
// @access  Public
router.get('/booked-dates/:propertyId', async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const today = new Date();
    today.setHours(0,0,0,0);

    const reservations = await Reservation.find({
      propertyId,
      status: { $in: ['Confirmed', 'Pending'] },
      checkOutDate: { $gte: today } // Flawlessly prune using Midnight
    });

    const bookedDates = [];
    reservations.forEach(r => {
      let currentDate = new Date(r.checkInDate);
      const end = new Date(r.checkOutDate);
      
      if (currentDate.getTime() === end.getTime()) {
         bookedDates.push(currentDate.toISOString().split('T')[0]);
      } else {
         // Exclude the sheer technical Departure Date since it structurally opens the Suite to a new Guest at 3PM!
         while (currentDate < end) {
           bookedDates.push(currentDate.toISOString().split('T')[0]);
           currentDate.setDate(currentDate.getDate() + 1);
         }
      }
    });

    res.json(bookedDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/inventory/my-reservations
// @desc    Get all reservations strictly bound to the authenticated user's email
// @access  Private (Guests)
router.get('/my-reservations', protect, async (req, res) => {
  try {
    // We intelligently use `req.user.email` allowing anonymous guest checkouts to flawlessly bind to identical accounts created later!
    const reservations = await Reservation.find({ guestEmail: req.user.email })
      .populate('propertyId', 'name roomType images basePrice')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/inventory/reservations
// @desc    Master lookup of all transactional bookings for Admin Ledger
// @access  Admin Only
router.get('/reservations', protect, admin, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('propertyId', 'name basePrice')
      .sort({ createdAt: -1 }); // Newest First
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/inventory/reservations/:id/confirm
// @desc    Admin manually overrides Webhooks to confirm reservation (Dev & Wire Transfers)
// @access  Admin Only
router.patch('/reservations/:id/confirm', protect, admin, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed' },
      { new: true }
    ).populate('propertyId', 'name basePrice roomType');
    
    if (!reservation) return res.status(404).json({ message: "Reservation not tracked natively" });

    // Instantly trigger the secure digital boarding pass directly to the client
    if (reservation.propertyId) {
      sendConfirmationEmail(reservation, reservation.propertyId);
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/inventory
// @desc    Check availability for a date range (Row-Per-Day strategy)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, propertyId } = req.query;
    
    // Default to a 30-day view if dates aren't specifically requested
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000));

    const query = {
      date: {
        $gte: start,
        $lte: end
      }
    };
    
    if (propertyId) query.propertyId = propertyId;

    // Fast query due to our compound index on (propertyId, date)
    const inventoryRecords = await Inventory.find(query).populate('propertyId', 'name basePrice roomType');
    res.json(inventoryRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/inventory/batch
// @desc    Init or update inventory dynamically (Admin Only)
// @access  Admin Action
router.post('/batch', async (req, res) => {
  try {
    // Expects an array of dates to allow batch generation (e.g. creating 1 year of inventory)
    const { propertyId, dates, availableQuantity, dynamicPrice } = req.body;
    
    const operations = dates.map((date) => ({
      updateOne: {
        filter: { propertyId, date: new Date(date) },
        update: { propertyId, date: new Date(date), availableQuantity, dynamicPrice },
        upsert: true // Creates if it doesn't exist, updates if it does
      }
    }));

    await Inventory.bulkWrite(operations);
    res.status(200).json({ message: `Successfully updated inventory for ${dates.length} days.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
