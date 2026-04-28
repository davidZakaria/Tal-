'use strict';

/**
 * BOOKING_OPENS_AT (optional): `YYYY-MM-DD` or ISO 8601. While the current time
 * is strictly before that instant (UTC midnight for date-only strings), guest
 * reservation requests are blocked. Omit or empty = no global pause (suites still
 * respect Property.openForBooking).
 */

function parseOpensAtMs() {
  const raw = process.env.BOOKING_OPENS_AT?.trim();
  if (!raw || /^false$/i.test(raw) || raw === '0') return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? null : ms;
}

function isBookingGloballyClosed() {
  const ms = parseOpensAtMs();
  if (ms === null) return false;
  return Date.now() < ms;
}

function bookingStatusPayload() {
  const ms = parseOpensAtMs();
  if (ms === null) {
    return { bookingOpen: true, opensAt: null };
  }
  const bookingOpen = Date.now() >= ms;
  const opensAt = new Date(ms).toISOString().slice(0, 10);
  return { bookingOpen, opensAt };
}

module.exports = {
  isBookingGloballyClosed,
  bookingStatusPayload,
};
