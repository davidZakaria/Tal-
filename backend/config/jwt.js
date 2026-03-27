/**
 * Central JWT secret resolution. Production requires a strong JWT_SECRET.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be set to a random string of at least 32 characters in production'
      );
    }
    return secret;
  }
  return secret || 'tale-dev-only-jwt-secret-not-for-production';
}

module.exports = { getJwtSecret };
