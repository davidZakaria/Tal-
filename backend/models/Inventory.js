const mongoose = require('mongoose');

// Row-Per-Day inventory approach for performant availability lookups
const inventorySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  date: { type: Date, required: true },
  availableQuantity: { type: Number, required: true },
  dynamicPrice: { type: Number }, // Allows overriding basePrice on specific days
}, { timestamps: true });

// Prevent duplicate entries for the exact same property on the exact same date
inventorySchema.index({ propertyId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
