const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Property = require('../models/Property');
const { sendConfirmationEmail } = require('../utils/emailService');
const Reservation = require('../models/Reservation');
const { protect, admin, guestOnly } = require('../middleware/authMiddleware');

const BLOCKING_STATUSES = ['ApprovedAwaitingPayment', 'Confirmed'];

function dateRangesOverlap(in1, out1, in2, out2) {
  const a = new Date(in1).getTime();
  const b = new Date(out1).getTime();
  const c = new Date(in2).getTime();
  const d = new Date(out2).getTime();
  return a < d && c < b;
}

function nightsBetween(arrival, departure) {
  const d1 = new Date(arrival);
  const d2 = new Date(departure);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

// @route   GET /api/inventory/booked-dates/:propertyId
// @desc    Dates occupied by approved or paid reservations (not pending admin approval)
// @access  Public
router.get('/booked-dates/:propertyId', async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservations = await Reservation.find({
      propertyId,
      status: { $in: BLOCKING_STATUSES },
      checkOutDate: { $gte: today },
    });

    const bookedDates = [];
    reservations.forEach((r) => {
      let currentDate = new Date(r.checkInDate);
      const end = new Date(r.checkOutDate);

      if (currentDate.getTime() === end.getTime()) {
        bookedDates.push(currentDate.toISOString().split('T')[0]);
      } else {
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
// @desc    Reservations for the authenticated guest
// @access  Private (Guests)
router.get('/my-reservations', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      $or: [{ guestEmail: req.user.email }, { userId: req.user._id }],
    })
      .populate('propertyId', 'name roomType images basePrice openForBooking')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/inventory/reservation-request
// @desc    Guest submits a booking request (no payment until admin approves)
// @access  Private Guest
router.post('/reservation-request', protect, guestOnly, async (req, res) => {
  try {
    const { propertyId, arrival, departure, guestPhone } = req.body;
    if (!propertyId || !arrival || !departure || !guestPhone) {
      return res.status(400).json({ message: 'propertyId, arrival, departure, and guestPhone are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!property.openForBooking) {
      return res.status(403).json({ message: 'This suite is not open for booking' });
    }

    const nights = nightsBetween(arrival, departure);
    const subtotal = property.basePrice * nights;
    const totalPrice = Math.round(subtotal);

    const blocking = await Reservation.find({
      propertyId,
      status: { $in: BLOCKING_STATUSES },
    });

    for (const r of blocking) {
      if (dateRangesOverlap(arrival, departure, r.checkInDate, r.checkOutDate)) {
        return res.status(409).json({ message: 'Those dates overlap an existing approved or confirmed booking' });
      }
    }

    const reservation = await Reservation.create({
      userId: req.user._id,
      guestName: req.user.name || 'Guest',
      guestEmail: req.user.email,
      guestPhone: String(guestPhone).trim(),
      propertyId,
      checkInDate: arrival,
      checkOutDate: departure,
      totalPrice,
      status: 'PendingApproval',
      paymentStatus: 'unpaid',
    });

    const populated = await Reservation.findById(reservation._id).populate(
      'propertyId',
      'name roomType images basePrice openForBooking'
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/inventory/reservations
// @desc    Admin ledger
// @access  Admin Only
router.get('/reservations', protect, admin, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('propertyId', 'name basePrice openForBooking')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/inventory/reservations/:id/approve
// @access  Admin Only
router.patch('/reservations/:id/approve', protect, admin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.status !== 'PendingApproval') {
      return res.status(400).json({ message: 'Only pending approval requests can be approved' });
    }

    const property = await Property.findById(reservation.propertyId);
    if (!property || !property.openForBooking) {
      return res.status(400).json({ message: 'Property is closed for booking' });
    }

    const blocking = await Reservation.find({
      propertyId: reservation.propertyId,
      status: { $in: BLOCKING_STATUSES },
      _id: { $ne: reservation._id },
    });

    for (const r of blocking) {
      if (
        dateRangesOverlap(
          reservation.checkInDate,
          reservation.checkOutDate,
          r.checkInDate,
          r.checkOutDate
        )
      ) {
        return res.status(409).json({ message: 'Dates now conflict with another approved or confirmed booking' });
      }
    }

    reservation.status = 'ApprovedAwaitingPayment';
    reservation.approvedAt = new Date();
    await reservation.save();

    const populated = await Reservation.findById(reservation._id).populate(
      'propertyId',
      'name basePrice roomType'
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/inventory/reservations/:id/reject
// @access  Admin Only
router.patch('/reservations/:id/reject', protect, admin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.status !== 'PendingApproval') {
      return res.status(400).json({ message: 'Only pending approval requests can be rejected' });
    }
    reservation.status = 'Rejected';
    await reservation.save();
    const populated = await Reservation.findById(reservation._id).populate(
      'propertyId',
      'name basePrice'
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/inventory/reservations/:id/confirm
// @desc    Admin marks as paid without PayMob (wire transfer / dev)
// @access  Admin Only
router.patch('/reservations/:id/confirm', protect, admin, async (req, res) => {
  try {
    const existing = await Reservation.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Reservation not tracked natively' });
    if (existing.status !== 'ApprovedAwaitingPayment') {
      return res.status(400).json({
        message: 'Manual confirmation is only allowed for reservations approved and awaiting payment',
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed', paymentStatus: 'paid', paidAt: new Date() },
      { new: true }
    ).populate('propertyId', 'name basePrice roomType');

    if (reservation.propertyId) {
      sendConfirmationEmail(reservation, reservation.propertyId);
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/inventory
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, propertyId } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    if (propertyId) query.propertyId = propertyId;

    const inventoryRecords = await Inventory.find(query).populate(
      'propertyId',
      'name basePrice roomType'
    );
    res.json(inventoryRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/inventory/batch
// @access  Admin Action
router.post('/batch', async (req, res) => {
  try {
    const { propertyId, dates, availableQuantity, dynamicPrice } = req.body;

    const operations = dates.map((date) => ({
      updateOne: {
        filter: { propertyId, date: new Date(date) },
        update: { propertyId, date: new Date(date), availableQuantity, dynamicPrice },
        upsert: true,
      },
    }));

    await Inventory.bulkWrite(operations);
    res.status(200).json({ message: `Successfully updated inventory for ${dates.length} days.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
