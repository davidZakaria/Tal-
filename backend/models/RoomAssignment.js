const mongoose = require('mongoose');

const roomAssignmentSchema = new mongoose.Schema({
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  physicalRoomNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
}, { timestamps: true });

// Ensures a physical room cannot be double-booked on overlapping dates
roomAssignmentSchema.index({ physicalRoomNumber: 1, checkInDate: 1, checkOutDate: 1 }, { unique: true });

module.exports = mongoose.model('RoomAssignment', roomAssignmentSchema);
