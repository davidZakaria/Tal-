const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (reservation, property) => {
  try {
    // If no keys exist, fail silently to prevent crashing dev servers
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[Email pipeline offline] Missing EMAIL_USER & EMAIL_PASS. Booking confirmed for ${reservation.guestEmail} but no HTML email sent.`);
      return;
    }

    // Connect dynamically to Gmail's SMTP servers
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const checkIn = new Date(reservation.checkInDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const checkOut = new Date(reservation.checkOutDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fbf8f5; padding: 40px 0; color: #06405a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(6,64,90,0.1);">
        <!-- Header -->
        <div style="background-color: #06405a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 32px; font-weight: normal; letter-spacing: 2px; margin: 0;">Talé Resort</h1>
          <p style="color: #e3c8ab; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin-top: 10px;">Galala City • Red Sea</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 50px 40px;">
          <h2 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: normal; margin-bottom: 20px;">Your Sanctuary Awaits.</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 30px;">
            Dear Guest,<br><br>
            Your reservation at Talé is officially confirmed. We are absolutely thrilled to welcome you to the absolute pinnacle of coastal hospitality. Attached below is your secure digital boarding pass containing your private itinerary.
          </p>
          
          <!-- Itinerary Box -->
          <div style="background-color: #f8fcfd; border: 1px solid #e1eff5; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888888; font-weight: bold; border-bottom: 1px solid #e1eff5; padding-bottom: 10px; margin-bottom: 20px;">Official Itinerary Ledger</p>
            
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 5px 0;">Reserved Structure</p>
              <p style="font-size: 18px; color: #06405a; font-family: 'Georgia', serif; font-style: italic; font-weight: bold; margin: 0;">${property.name}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <div style="flex: 1;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 5px 0;">Arrival</p>
                <p style="font-size: 14px; font-weight: bold; color: #06405a; margin: 0;">${checkIn}</p>
              </div>
              <div style="flex: 1;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 5px 0;">Departure</p>
                <p style="font-size: 14px; font-weight: bold; color: #06405a; margin: 0;">${checkOut}</p>
              </div>
            </div>
          </div>
          
          <!-- Financials -->
          <div style="border-top: 1px solid #eeeeee; padding-top: 25px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 5px 0;">Total Settled Balance</p>
              <p style="font-size: 22px; font-weight: bold; color: #e2725b; margin: 0;">${reservation.totalPrice} <span style="font-size:12px; color:#aaa;">EGP</span></p>
            </div>
            <div style="text-align: right;">
               <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 5px 0;">Secure Reference</p>
               <p style="font-size: 14px; font-family: monospace; font-weight: bold; letter-spacing: 2px; color: #06405a; background-color: #f1f5f9; padding: 6px 12px; border-radius: 6px; margin: 0;">#${reservation.bookingCode || `Talé-${reservation._id.toString().substring(18, 24).toUpperCase()}`}</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fbf8f5; padding: 30px; text-align: center; border-top: 1px solid #f0e6da;">
          <p style="font-size: 12px; color: #888888; line-height: 1.6; letter-spacing: 0.5px; margin: 0;">
            Should you require exclusive arrangements prior to arrival, please reply directly to this secure thread.<br><br>
            <strong>Talé Hotels & Resorts</strong> • The Pinnacle of Red Sea Luxury.
          </p>
        </div>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"Talé Concierge" <${process.env.EMAIL_USER}>`,
      to: reservation.guestEmail,
      subject: `Your Sanctuary is Confirmed • ${property.name}`,
      html: htmlContent
    });

    console.log(`[Email Pipeline] Massive Success! Delivered secure digital boarding pass immediately to ${reservation.guestEmail}`);
  } catch (error) {
    console.error('[Email Pipeline Breakdown]', error);
  }
};

module.exports = { sendConfirmationEmail };
