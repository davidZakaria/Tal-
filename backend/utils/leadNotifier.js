const nodemailer = require('nodemailer');

/**
 * Notify the sales inbox when a new presentation request arrives,
 * and send the lead a short auto-reply so they know it landed.
 *
 * Fails silently on any transport error — a dropped email should never
 * break the 201 response we just returned to the user.
 */
async function notifyNewLead(lead) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(
      `[Leads] No EMAIL_USER/EMAIL_PASS set — skipped notification for "${lead.email}".`
    );
    return;
  }

  const salesInbox = process.env.LEADS_INBOX || process.env.EMAIL_USER;
  const salesReply = process.env.LEADS_REPLY_TO || process.env.EMAIL_USER;
  const autoReplyEnabled = process.env.LEADS_AUTOREPLY !== 'false';

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } catch (err) {
    console.error('[Leads] Could not create mail transport:', err.message);
    return;
  }

  const createdAt = new Date(lead.createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const safeNotes = (lead.notes || '').trim();
  const safeLocale = (lead.locale || '').trim();

  const internalHtml = `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#fbf8f5; padding:32px 0; color:#06405a;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 12px 36px rgba(6,64,90,0.08);">
      <div style="background:#06405a; padding:28px 32px;">
        <p style="color:#e3c8ab; font-size:10px; letter-spacing:4px; text-transform:uppercase; margin:0;">Talé Hotel • Lead Alert</p>
        <h1 style="color:#ffffff; font-family:Georgia,serif; font-weight:normal; font-size:22px; margin:6px 0 0 0;">New presentation request</h1>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#06405a;">
          <tr><td style="padding:6px 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px;">Name</td><td style="padding:6px 0; font-weight:600;">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:6px 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px;">Email</td><td style="padding:6px 0;"><a href="mailto:${encodeURIComponent(lead.email)}" style="color:#06405a;">${escapeHtml(lead.email)}</a></td></tr>
          <tr><td style="padding:6px 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px;">Phone</td><td style="padding:6px 0;"><a href="tel:${encodeURIComponent(lead.phone)}" style="color:#06405a;">${escapeHtml(lead.phone)}</a></td></tr>
          ${safeLocale ? `<tr><td style="padding:6px 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px;">Locale</td><td style="padding:6px 0;">${escapeHtml(safeLocale)}</td></tr>` : ''}
          <tr><td style="padding:6px 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px;">Received</td><td style="padding:6px 0;">${escapeHtml(createdAt)}</td></tr>
          ${safeNotes ? `<tr><td style="padding:6px 0 0; color:#888; text-transform:uppercase; letter-spacing:1px; font-size:11px; vertical-align:top;">Notes</td><td style="padding:6px 0 0; white-space:pre-wrap;">${escapeHtml(safeNotes)}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px; font-size:12px; color:#888;">Reply directly to the guest by hitting Reply — this email's reply-to is set to their address.</p>
      </div>
    </div>
  </div>
  `;

  const guestHtml = `
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background:#fbf8f5; padding:40px 0; color:#06405a;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(6,64,90,0.08);">
      <div style="background:#06405a; padding:40px; text-align:center;">
        <h1 style="color:#ffffff; font-family:Georgia,serif; font-size:28px; font-weight:normal; letter-spacing:2px; margin:0;">Talé Hotel</h1>
        <p style="color:#e3c8ab; font-size:10px; text-transform:uppercase; letter-spacing:4px; margin-top:10px;">Galala City • Red Sea</p>
      </div>
      <div style="padding:40px;">
        <h2 style="font-family:Georgia,serif; font-size:22px; font-weight:normal; margin:0 0 16px;">Thank you, ${escapeHtml(lead.name.split(' ')[0] || 'guest')}.</h2>
        <p style="font-size:14px; line-height:1.7; color:#444; margin:0 0 18px;">
          We have received your request for a private presentation. Our membership director
          will be in touch within 24 hours to arrange a personal walkthrough and answer any
          questions about the 10-year membership programme.
        </p>
        <p style="font-size:14px; line-height:1.7; color:#444; margin:0;">
          If your request is time sensitive, reply directly to this email and we will
          prioritise your case.
        </p>
      </div>
      <div style="background:#fbf8f5; padding:24px; text-align:center; border-top:1px solid #f0e6da;">
        <p style="font-size:12px; color:#888; line-height:1.6; margin:0;">
          <strong>Talé Hotels &amp; Resorts</strong> • The Pinnacle of Red Sea Luxury.
        </p>
      </div>
    </div>
  </div>
  `;

  const sendInternal = transporter
    .sendMail({
      from: `"Talé Leads" <${process.env.EMAIL_USER}>`,
      to: salesInbox,
      replyTo: lead.email,
      subject: `New presentation request — ${lead.name}`,
      html: internalHtml,
      text:
        `New presentation request\n\n` +
        `Name:  ${lead.name}\n` +
        `Email: ${lead.email}\n` +
        `Phone: ${lead.phone}\n` +
        (safeLocale ? `Locale: ${safeLocale}\n` : '') +
        (safeNotes ? `Notes: ${safeNotes}\n` : '') +
        `Received: ${createdAt}\n`,
    })
    .catch((err) => console.error('[Leads] Internal notify failed:', err.message));

  const sendGuest = autoReplyEnabled
    ? transporter
        .sendMail({
          from: `"Talé Concierge" <${process.env.EMAIL_USER}>`,
          to: lead.email,
          replyTo: salesReply,
          subject: 'Your private presentation request — Talé Hotel',
          html: guestHtml,
          text:
            `Thank you, ${lead.name.split(' ')[0] || 'guest'}.\n\n` +
            `We received your request for a private presentation. Our membership ` +
            `director will contact you within 24 hours.\n\n` +
            `— Talé Hotels & Resorts`,
        })
        .catch((err) => console.error('[Leads] Auto-reply failed:', err.message))
    : Promise.resolve();

  await Promise.allSettled([sendInternal, sendGuest]);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { notifyNewLead };
