---
name: Cloudinary Uploads
description: Instructions for handling secure media uploads to Cloudinary via Signed Uploads.
---

# Cloudinary Integration Guidelines

1. **Upload Mechanism**: Ensure authorized users use Signed Uploads extensively to prevent unauthenticated media uploads to the bucket.
2. **Backend implementation**: Provide an endpoint (e.g. `/api/media/signature`) using `multer` to accept uploads and process them, or directly pass signed upload signatures via the Cloudinary Node SDK (`cloudinary.utils.api_sign_request`) if the frontend handles the direct upload.
3. **Transformations**: Utilize on-the-fly transformations (e.g., `q_auto,f_auto,w_800`) when serving media URLs instead of storing multiple raw sizes to improve caching and application performance.
