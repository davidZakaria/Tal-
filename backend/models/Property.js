const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  roomType: { type: String, required: true }, // e.g., "Ocean View Suite"
  basePrice: { type: Number, required: true },
  amenities: [{ type: String }],
  capacity: { type: Number, required: true },
  images: [{ type: String }], // Cloudinary URLs
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
