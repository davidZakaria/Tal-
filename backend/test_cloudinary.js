require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'tale_properties' },
      cloudinary.config().api_secret
    );

    const formData = new URLSearchParams();
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "tale_properties");

    // Polyfill fetch for Node 16/18 compatibility just in case
    const fetchAPI = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

    const response = await fetchAPI(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log("CLOUDINARY_EXACT_ERROR:", data);
  } catch (error) {
    console.log("Script Execution Error:", error);
  }
}
test();
