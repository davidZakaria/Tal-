const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

/** Trim quotes/whitespace — common .env mistakes break signatures and cause Cloudinary 401. */
function envTrim(key) {
  const v = process.env[key];
  if (v == null) return '';
  return String(v).trim().replace(/^["']|["']$/g, '');
}

const cloudName = envTrim('CLOUDINARY_CLOUD_NAME');
const apiKey = envTrim('CLOUDINARY_API_KEY');
const apiSecret = envTrim('CLOUDINARY_API_SECRET');

const hasRealCredentials =
  Boolean(cloudName) &&
  Boolean(apiKey) &&
  Boolean(apiSecret) &&
  !(apiKey === 'test_key' && apiSecret === 'test_secret');

if (process.env.NODE_ENV === 'production') {
  if (!hasRealCredentials) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required in production');
  }
}

cloudinary.config({
  cloud_name: cloudName || 'tale_hotel',
  api_key: apiKey || 'test_key',
  api_secret: apiSecret || 'test_secret',
});

// @route   GET /api/media/signature
// @desc    Get Cloudinary signature for secure frontend uploads (Skill execution)
// @access  Admin / Guest
router.get('/signature', (req, res) => {
  try {
    if (!hasRealCredentials) {
      return res.status(503).json({
        message:
          'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env (no spaces in cloud name — copy from Dashboard → Settings → Product environment credentials). Restart the API.',
        code: 'CLOUDINARY_NOT_CONFIGURED',
      });
    }

    if (/\s/.test(cloudName)) {
      return res.status(400).json({
        message:
          'CLOUDINARY_CLOUD_NAME must not contain spaces. Use the exact Cloud name from Cloudinary (e.g. dxxxx), not your account display name.',
        code: 'CLOUDINARY_INVALID_CLOUD_NAME',
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const targetFolder = String(req.query.folder || 'tale_properties').trim() || 'tale_properties';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: targetFolder },
      cloudinary.config().api_secret
    );

    res.json({
      timestamp,
      signature,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder: targetFolder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
