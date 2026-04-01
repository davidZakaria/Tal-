const mongoose = require('mongoose');
const crypto = require('crypto');

const STATUS = [
  'PendingApproval',
  'ApprovedAwaitingPayment',
  'Confirmed',
  'Cancelled',
  'Rejected',
];

const PAYMENT_STATUS = ['unpaid', 'pending_gateway', 'paid', 'failed'];

function randomBookingSuffix() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

const reservationSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: STATUS, default: 'PendingApproval' },
  paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'unpaid' },
  paymentGatewayReference: { type: String },
  approvedAt: { type: Date },
  paidAt: { type: Date },
}, { timestamps: true });

reservationSchema.pre('save', async function assignBookingCode(next) {
  if (this.bookingCode) return next();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `Talé-${randomBookingSuffix()}`;
    const clash = await this.constructor.findOne({ bookingCode: code }).select('_id').lean();
    if (!clash) {
      this.bookingCode = code;
      return next();
    }
  }
  next(new Error('Could not allocate a unique booking code'));
});

module.exports = mongoose.model('Reservation', reservationSchema);
