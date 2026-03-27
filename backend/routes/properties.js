const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Reservation = require('../models/Reservation');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/properties
// @desc    Get all properties (Public - For Guest Browsing) with Live Occupancy
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rawProperties = await Property.find({}).sort({ basePrice: 1 }).lean();
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Cross-reference MongoDB concurrently to dynamically ascertain active occupancies
    const propertiesWithOccupancy = await Promise.all(rawProperties.map(async (prop) => {
      const activeReservation = await Reservation.findOne({
        propertyId: prop._id,
        status: { $in: ['Confirmed', 'Pending'] },
        checkInDate: { $lte: today },
        checkOutDate: { $gte: today }
      });
      return { ...prop, isOccupiedToday: !!activeReservation };
    }));

    res.json(propertiesWithOccupancy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/properties
// @desc    Create a new property
// @access  Admin Guarded
router.post('/', protect, admin, async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update an existing property completely securely
// @access  Admin Guarded
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not tracked natively.' });
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Wipe an existing property structurally
// @access  Admin Guarded
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not tracked natively.' });
    res.json({ message: 'Property irrevocably wiped from records.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
