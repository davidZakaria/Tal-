const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Reservation = require('../models/Reservation');
const { sendConfirmationEmail } = require('../utils/emailService');

// Polyfill fetch for older Node versions
const fetchAPI = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

// ==========================================
// 1. GENERATE PAYMOB IFRAME SECURE CHECKOUT
// ==========================================
router.post('/checkout', async (req, res) => {
  try {
    const { amountEGP, propertyId, guests, arrival, departure } = req.body;
    
    if (!process.env.PAYMOB_API_KEY) {
      return res.status(400).json({ error: "PAYMOB_API_KEY is not configured in backend setup." });
    }

    // -- Database Step 0: Create Pending Reservation --
    const pendingReservation = await Reservation.create({
      guestName: req.body.guestName || "Tale Luxury Guest",
      guestEmail: req.body.guestEmail || "guest@talehotel.com",
      guestPhone: req.body.guestPhone || "+20123456789",
      propertyId,
      checkInDate: arrival,
      checkOutDate: departure,
      totalPrice: amountEGP,
      status: 'Pending'
    });

    // -- PayMob Step 1: Authentication --
    const authReq = await fetchAPI("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
    });
    const authData = await authReq.json();
    const token = authData.token;

    // -- PayMob Step 2: Order Registration --
    const orderReq = await fetchAPI("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: "false",
        amount_cents: Math.round(amountEGP * 100), // API operates strictly in cents
        currency: "EGP",
        merchant_order_id: pendingReservation._id.toString(), // Hard-reference tracing payload!
        items: [{
          name: `Suite Reservation`,
          amount_cents: Math.round(amountEGP * 100),
          description: `Dates: ${arrival} - ${departure}`,
          quantity: "1"
        }]
      })
    });
    const orderData = await orderReq.json();
    if (!orderData || !orderData.id) throw new Error("PayMob rejected Registration Order creation.");

    // -- Database Step 1.5 Update Tracking Order ID --
    pendingReservation.paymentGatewayReference = orderData.id.toString();
    await pendingReservation.save();

    // -- PayMob Step 3: Payment Key Generation --
    const paymentReq = await fetchAPI("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amountEGP * 100),
        expiration: 3600,
        order_id: orderData.id,
        currency: "EGP",
        integration_id: process.env.PAYMOB_INTEGRATION_ID || "12345", // Mock integration if none exists
        billing_data: {
          first_name: "Tale", last_name: "Guest", phone_number: "+20123456789", 
          email: "guest@tale.com", apartment: "NA", floor: "NA", 
          street: "NA", building: "NA", city: "NA", country: "EG", state: "NA"
        }
      })
    });
    const paymentData = await paymentReq.json();
    
    // Return the uniquely signed IFrame redirection URL directly to the frontend
    res.json({
      success: true,
      token: paymentData.token,
      iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID || "4321"}?payment_token=${paymentData.token}`
    });

  } catch (error) {
    console.error("PayMob Central Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PAYMOB SECURE HMAC-SHA512 WEBHOOK CALLBACK
// ==========================================
router.post('/webhook', async (req, res) => {
  const hmacSecret = process.env.HMAC_SECRET;
  const paymobHmac = req.query.hmac;
  const obj = req.body.obj;

  // PayMob Webhook mapping rules strictly require alphabetical nested flattening
  const keys = [
    'amount_cents', 'created_at', 'currency', 'error_occured',
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order.id', 'owner', 'pending', 'source_data.pan',
    'source_data.sub_type', 'source_data.type', 'success'
  ];

  let concatenatedString = '';
  keys.forEach(key => {
    // Nested drill down parsing logic for 'order.id' style structures
    const value = key.includes('.') 
      ? key.split('.').reduce((o, i) => (o ? o[i] : ''), obj)
      : obj[key];
    concatenatedString += value;
  });

  const secureHash = crypto
    .createHmac('sha512', hmacSecret || "MOCK_SECRET")
    .update(concatenatedString)
    .digest('hex');

  // Verify HMAC Identity Signature strictly against forged transactions
  if (secureHash === paymobHmac) {
    if (obj.success === true) {
      console.log(`[PAYMOB SECURE] Successful Payment of ${obj.amount_cents / 100} EGP for Order #${obj.order.id}`);
      
      try {
        const confirmedRes = await Reservation.findOneAndUpdate(
          { paymentGatewayReference: obj.order.id.toString() },
          { status: 'Confirmed' },
          { new: true }
        ).populate('propertyId', 'name basePrice roomType');

        if (confirmedRes) {
           console.log("[DB SUCCESS] MongoDB Reservation Locked to Confirmed!");
           if (confirmedRes.propertyId) {
             sendConfirmationEmail(confirmedRes, confirmedRes.propertyId);
           }
        } else {
           console.log("[DB ERROR] Webhook matched no Internal Tracking References.");
        }
      } catch (err) {
        console.error("[DB CRITICAL TIMEOUT] ", err);
      }
    }
  } else {
    console.error(`[PAYMOB SECURITY WARNING] HMAC Verfication Failed! Payload spoofing suspected.`);
  }

  // Extremely important: Always return 200 HTTP otherwise PayMob enters intensive retry loops
  res.status(200).json({ status: "Securely Received" });
});

module.exports = router;
