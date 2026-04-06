export const BOOKING_INTENT_KEY = "tale_booking_intent";

export type BookingIntent = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function setBookingIntent(intent: BookingIntent): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOKING_INTENT_KEY, JSON.stringify(intent));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getBookingIntent(): BookingIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingIntent;
    if (
      typeof parsed.checkIn !== "string" ||
      typeof parsed.checkOut !== "string" ||
      typeof parsed.guests !== "number" ||
      parsed.guests < 1
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBookingIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BOOKING_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

export function bookingIntentSearchParams(intent: BookingIntent): string {
  const p = new URLSearchParams();
  p.set("checkIn", intent.checkIn);
  p.set("checkOut", intent.checkOut);
  p.set("guests", String(intent.guests));
  return p.toString();
}

export function propertyHrefWithIntent(propertyId: string, intent: BookingIntent | null): string {
  if (!intent) return `/properties/${propertyId}`;
  return `/properties/${propertyId}?${bookingIntentSearchParams(intent)}`;
}
