const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect, admin } = require('../middleware/authMiddleware');
const { notifyNewLead } = require('../utils/leadNotifier');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

function sanitize(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * Public endpoints are targets for bots. Limit each IP to a small burst of
 * submissions, then a sustained rate. Tune via env when needed.
 */
const leadSubmitLimiter = rateLimit({
  windowMs: Number(process.env.LEAD_RATE_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LEAD_RATE_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Too many requests from this location. Please try again shortly.',
  },
});

// @route   POST /api/leads
// @desc    Capture a private-presentation request from the marketing site
// @access  Public (rate-limited + honeypot-guarded)
router.post('/', leadSubmitLimiter, async (req, res) => {
  try {
    // Honeypot: browser-filled hidden field. Real users never fill it.
    const honeypot = typeof req.body?.website === 'string' ? req.body.website.trim() : '';
    if (honeypot) {
      // Pretend it succeeded — bots stop retrying; we simply don't store.
      return res.status(201).json({ ok: true });
    }

    const name = sanitize(req.body?.name, 120);
    const email = sanitize(req.body?.email, 160).toLowerCase();
    const phone = sanitize(req.body?.phone, 40);
    const notes = sanitize(req.body?.notes, 500);
    const locale = sanitize(req.body?.locale, 8);

    const errors = {};
    if (!name) errors.name = 'Full name is required.';
    if (!email) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
    if (!phone) errors.phone = 'Phone number is required.';
    else if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number.';

    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, errors });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      notes,
      locale: locale || undefined,
      source: 'presentation_request',
    });

    // Fire-and-forget: never block the response on email delivery.
    notifyNewLead(lead).catch((err) =>
      console.error('[Leads] notify error:', err?.message || err)
    );

    return res.status(201).json({ ok: true, id: lead._id });
  } catch (error) {
    console.error('[TALÉ] Lead capture failed:', error.message);
    return res.status(500).json({ ok: false, message: 'Could not save your request. Please try again.' });
  }
});

// @route   GET /api/leads
// @desc    List all captured leads (newest first) for the admin console
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json(leads);
  } catch (error) {
    console.error('[TALÉ] Lead list failed:', error.message);
    return res
      .status(500)
      .json({ message: 'Could not load leads. Try again in a moment.' });
  }
});

// @route   PATCH /api/leads/:id
// @desc    Update status / assigned owner / notes for a lead
// @access  Admin
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body?.status === 'string') updates.status = req.body.status;
    if (typeof req.body?.notes === 'string') updates.notes = sanitize(req.body.notes, 2000);
    if (typeof req.body?.assignedTo === 'string') updates.assignedTo = sanitize(req.body.assignedTo, 120);

    const allowedStatuses = ['new', 'contacted', 'qualified', 'archived'];
    if (updates.status && !allowedStatuses.includes(updates.status)) {
      return res.status(400).json({ message: 'Unknown status value.' });
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    return res.json(lead);
  } catch (error) {
    console.error('[TALÉ] Lead update failed:', error.message);
    return res.status(500).json({ message: 'Could not update the lead.' });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Remove a lead from the ledger
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[TALÉ] Lead delete failed:', error.message);
    return res.status(500).json({ message: 'Could not delete the lead.' });
  }
});

module.exports = router;
