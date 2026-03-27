const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configure via environment variables ideally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'tale_hotel',
  api_key: process.env.CLOUDINARY_API_KEY || 'test_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'test_secret',
});

// @route   GET /api/media/signature
// @desc    Get Cloudinary signature for secure frontend uploads (Skill execution)
// @access  Admin / Guest
router.get('/signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Dynamically retrieve the targeted destination folder or default to Properties
    const targetFolder = req.query.folder || 'tale_properties';
    
    // As per SKILL.md: Ensure authorized users use Signed Uploads extensively
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: targetFolder },
      cloudinary.config().api_secret
    );
    
    res.json({ 
      timestamp, 
      signature, 
      cloudName: cloudinary.config().cloud_name, 
      apiKey: cloudinary.config().api_key,
      folder: targetFolder 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
