const mongoose = require('mongoose');

const LEAD_SOURCES = ['presentation_request', 'other'];
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'archived'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    source: { type: String, enum: LEAD_SOURCES, default: 'presentation_request' },
    status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
    locale: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    assignedTo: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ email: 1 });

module.exports = mongoose.model('Lead', leadSchema);
