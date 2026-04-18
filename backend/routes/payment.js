const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Reservation = require('../models/Reservation');
const { sendConfirmationEmail } = require('../utils/emailService');
const { protect, guestOnly } = require('../middleware/authMiddleware');

const fetchAPI = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

/**
 * PayMob is intentionally gated until the integration is production-ready.
 * Enable by setting both PAYMOB_ENABLED=true and PAYMOB_API_KEY in backend/.env.
 * When disabled, the admin completes payments manually via
 * PATCH /api/inventory/reservations/:id/confirm (bank transfer / cash settlement).
 */
function isPaymobEnabled() {
  const flag = String(process.env.PAYMOB_ENABLED || '').toLowerCase();
  const flagOn = flag === 'true' || flag === '1' || flag === 'yes';
  return flagOn && Boolean(process.env.PAYMOB_API_KEY);
}

// @route   GET /api/payment/config
// @desc    Public readiness probe used by the UI to show/hide card payment entry points
// @access  Public
router.get('/config', (req, res) => {
  res.json({ paymobCheckout: isPaymobEnabled() });
});

// ==========================================
// 1. PAYMOB CHECKOUT FOR AN APPROVED RESERVATION
// ==========================================
router.post('/checkout', protect, guestOnly, async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!isPaymobEnabled()) {
      return res.status(503).json({
        code: 'PAYMOB_DISABLED',
        message:
          'Online card payment is under development. Please contact our team to complete this reservation.',
      });
    }

    if (!reservationId) {
      return res.status(400).json({ message: 'reservationId is required' });
    }

    const reservation = await Reservation.findById(reservationId).populate('propertyId');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const userId = req.user._id.toString();
    const ownerId = reservation.userId ? reservation.userId.toString() : null;
    if (!ownerId || ownerId !== userId) {
      return res.status(403).json({ message: 'This reservation does not belong to your account' });
    }

    if (reservation.status !== 'ApprovedAwaitingPayment') {
      return res.status(400).json({
        message: 'Payment is only available after admin approval and before the stay is confirmed',
      });
    }

    const property = reservation.propertyId;
    if (!property || !property.openForBooking) {
      return res.status(403).json({ message: 'This suite is not open for booking' });
    }

    const amountEGP = reservation.totalPrice;
    const arrival = reservation.checkInDate;
    const departure = reservation.checkOutDate;

    const nameParts = (reservation.guestName || 'Guest').trim().split(/\s+/);
    const billingFirst = nameParts[0] || 'Guest';
    const billingLast = nameParts.slice(1).join(' ') || 'Tale';

    const authReq = await fetchAPI('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });
    const authData = await authReq.json();
    const token = authData.token;

    let orderId = reservation.paymentGatewayReference;

    if (!orderId) {
      const orderReq = await fetchAPI('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: token,
          delivery_needed: 'false',
          amount_cents: Math.round(amountEGP * 100),
          currency: 'EGP',
          merchant_order_id: reservation._id.toString(),
          items: [
            {
              name: 'Suite Reservation',
              amount_cents: Math.round(amountEGP * 100),
              description: `Dates: ${arrival} - ${departure}`,
              quantity: '1',
            },
          ],
        }),
      });
      const orderData = await orderReq.json();
      if (!orderData || !orderData.id) throw new Error('PayMob rejected Registration Order creation.');
      orderId = orderData.id.toString();
      reservation.paymentGatewayReference = orderId;
      reservation.paymentStatus = 'pending_gateway';
      await reservation.save();
    }

    const paymentReq = await fetchAPI('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amountEGP * 100),
        expiration: 3600,
        order_id: Number(orderId),
        currency: 'EGP',
        integration_id: process.env.PAYMOB_INTEGRATION_ID || '12345',
        billing_data: {
          first_name: billingFirst,
          last_name: billingLast,
          phone_number:
            String(reservation.guestPhone || '')
              .replace(/\s/g, '') || '+20123456789',
          email: reservation.guestEmail,
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          city: 'NA',
          country: 'EG',
          state: 'NA',
        },
      }),
    });
    const paymentData = await paymentReq.json();

    res.json({
      success: true,
      token: paymentData.token,
      iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID || '4321'}?payment_token=${paymentData.token}`,
    });
  } catch (error) {
    console.error('PayMob Central Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PAYMOB SECURE HMAC-SHA512 WEBHOOK CALLBACK
// ==========================================
router.post('/webhook', async (req, res) => {
  if (!isPaymobEnabled()) {
    return res.status(200).json({ status: 'PayMob disabled; ignoring webhook.' });
  }

  const hmacSecret = process.env.HMAC_SECRET;
  const paymobHmac = req.query.hmac;
  const obj = req.body.obj;

  const keys = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];

  let concatenatedString = '';
  keys.forEach((key) => {
    const value = key.includes('.')
      ? key.split('.').reduce((o, i) => (o ? o[i] : ''), obj)
      : obj[key];
    concatenatedString += value;
  });

  const secureHash = crypto
    .createHmac('sha512', hmacSecret || 'MOCK_SECRET')
    .update(concatenatedString)
    .digest('hex');

  if (secureHash === paymobHmac) {
    if (obj.success === true) {
      console.log(
        `[PAYMOB SECURE] Successful Payment of ${obj.amount_cents / 100} EGP for Order #${obj.order.id}`
      );

      try {
        const confirmedRes = await Reservation.findOneAndUpdate(
          { paymentGatewayReference: obj.order.id.toString() },
          {
            status: 'Confirmed',
            paymentStatus: 'paid',
            paidAt: new Date(),
          },
          { new: true }
        ).populate('propertyId', 'name basePrice roomType');

        if (confirmedRes) {
          console.log('[DB SUCCESS] MongoDB Reservation Locked to Confirmed!');
          if (confirmedRes.propertyId) {
            sendConfirmationEmail(confirmedRes, confirmedRes.propertyId);
          }
        } else {
          console.log('[DB ERROR] Webhook matched no Internal Tracking References.');
        }
      } catch (err) {
        console.error('[DB CRITICAL TIMEOUT] ', err);
      }
    }
  } else {
    console.error('[PAYMOB SECURITY WARNING] HMAC Verfication Failed! Payload spoofing suspected.');
  }

  res.status(200).json({ status: 'Securely Received' });
});

module.exports = router;
