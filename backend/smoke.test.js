/**
 * Minimal sanity checks (no Jest). Run: npm test
 */
process.env.NODE_ENV = 'test';

const assert = require('assert');
const { getJwtSecret } = require('./config/jwt');

// In test env, dev fallback should work without JWT_SECRET
const secret = getJwtSecret();
assert(typeof secret === 'string' && secret.length > 0, 'getJwtSecret returns a string');

console.log('backend smoke.test.js: ok');
