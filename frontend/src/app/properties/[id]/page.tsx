"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProperty } from "@/hooks/useProperties";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Wifi,
  Wind,
  Coffee,
  Bed,
  Bath,
  Waves,
  Loader2,
  Calendar,
  AlertCircle,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useSyncExternalStore } from "react";
import { apiUrl } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";
import { guestSignInUrl, shouldRedirectGuestToSignIn } from "@/lib/guestReturnTo";
import { getBookingIntent } from "@/lib/bookingIntent";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  "High-Speed Fiber": Wifi,
  "Red Sea View": Waves,
  "Climate Control": Wind,
  "Mini Bar": Coffee,
  "Master Suite": Bed,
  "En-Suite Bath": Bath,
  "Private Pool": Waves,
  "Balcony Lounge": Wind,
  "Private Cinema": Coffee,
};

const springSoft = {
  type: "spring" as const,
  damping: 28,
  stiffness: 200,
};

export default function PropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const id = params?.id as string;
  const { data: property, isLoading, error } = useProperty(id);

  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [guestPhone, setGuestPhone] = useState("");
  const guestToken = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? localStorage.getItem("guestToken") : null),
    () => null
  );

  useEffect(() => {
    if (!id) return;
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const g = searchParams.get("guests");
    if (ci) setArrivalDate(ci);
    if (co) setDepartureDate(co);
    if (g) {
      const n = parseInt(g, 10);
      if (!Number.isNaN(n) && n >= 1) setGuests(n);
    }
    if (!ci && !co) {
      const intent = getBookingIntent();
      if (intent) {
        setArrivalDate(intent.checkIn);
        setDepartureDate(intent.checkOut);
        setGuests(intent.guests);
      }
    }
  }, [id, searchParams]);

  const [bookedDates, setBookedDates] = useState<string[]>([]);
  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/inventory/booked-dates/${id}`))
      .then((res) => res.json())
      .then((data) => setBookedDates(data || []))
      .catch(console.error);
  }, [id]);

  const checkConflict = () => {
    if (!arrivalDate || !departureDate) return false;
    const curr = new Date(arrivalDate);
    const last = new Date(departureDate);

    if (curr > last) return true;

    if (curr.getTime() === last.getTime()) {
      return bookedDates.includes(curr.toISOString().split("T")[0]);
    }

    while (curr < last) {
      if (bookedDates.includes(curr.toISOString().split("T")[0])) return true;
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };
  const hasConflict = checkConflict();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-charcoal">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-gold" aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-white/50">Loading suite</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-charcoal px-6 text-center">
        <p className="font-serif text-2xl text-brand-white/90 md:text-3xl">This suite could not be found.</p>
        <Link
          href="/#sanctuaries"
          className="rounded-full border border-brand-gold/40 bg-brand-teal/50 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold transition-colors hover:bg-brand-teal hover:text-brand-white"
        >
          Browse sanctuaries
        </Link>
      </div>
    );
  }

  let nights = 1;
  if (arrivalDate && departureDate) {
    const d1 = new Date(arrivalDate);
    const d2 = new Date(departureDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) nights = diff;
  }

  const totalPrice = property.basePrice * nights;
  const openForBooking = property.openForBooking !== false;
  const extraImages = property.images?.slice(1, 5) ?? [];
  const motionOff = reduceMotion === true;

  return (
    <div className="min-h-screen min-w-0 bg-brand-charcoal text-brand-white selection:bg-brand-gold/30">
      {/* Sticky brand bar — home nav scale + clean actions */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-brand-teal shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6 md:px-10 md:py-5">
          <SiteLogo
            href="/"
            variant="onLight"
            wrapperClassName="h-16 w-48 shrink-0 sm:h-20 sm:w-56 md:h-24 md:w-64 lg:h-28 lg:w-72"
            linkClassName="ring-offset-brand-teal"
            priority
          />
          <nav
            className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            aria-label="Page"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-white/95 transition-colors hover:bg-white/10 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-teal sm:h-12 sm:px-5 sm:text-xs sm:tracking-[0.2em]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              Back
            </button>
            <span className="hidden h-6 w-px bg-brand-white/15 sm:block" aria-hidden />
            <Link
              href="/#sanctuaries"
              className="inline-flex h-11 items-center rounded-full border border-brand-gold/45 bg-brand-gold/12 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold transition-colors hover:border-brand-gold/70 hover:bg-brand-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-teal sm:h-12 sm:px-6 sm:text-xs sm:tracking-[0.2em]"
            >
              All suites
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — aspect-ratio frame, editorial crop */}
      <section className="relative px-4 pt-6 sm:px-6 md:px-10">
        <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[1.75rem] border border-brand-gold/25 bg-brand-forest shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:rounded-[2.25rem]">
          <div className="relative aspect-video w-full max-h-[min(68vh,760px)] sm:aspect-[21/9]">
            {property.images && property.images.length > 0 ? (
              <Image
                src={property.images[0]}
                alt={property.name}
                fill
                sizes="(max-width: 768px) 100vw, 90vw"
                className="object-cover object-[center_42%]"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-teal/40">
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-brand-white/40">No imagery yet</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/55 to-transparent sm:via-brand-charcoal/40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-charcoal/50 via-transparent to-brand-charcoal/30" />

            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10 md:p-12">
              <motion.div
                initial={motionOff ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={motionOff ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold/90 sm:text-[11px]">
                  <span className="rounded-full border border-brand-gold/35 bg-brand-charcoal/50 px-3 py-1 backdrop-blur-sm">
                    {property.roomType || "Signature Suite"}
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-white/70">
                    <Users className="h-3.5 w-3.5 text-brand-gold/70" aria-hidden />
                    Up to {property.capacity || 2} guests
                  </span>
                </div>
                <h1 className="max-w-4xl font-serif text-3xl font-light leading-[1.1] tracking-tight text-brand-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {property.name}
                </h1>
                <p className="mt-4 max-w-xl text-sm font-light text-brand-white/75 sm:text-base">
                  Talé · Galala City — curated coastal living on the Red Sea.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {extraImages.length > 0 && (
          <div className="mx-auto mt-6 flex max-w-[1600px] gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
            {extraImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-gold/20 sm:h-24 sm:w-36 sm:rounded-2xl"
              >
                <Image src={src} alt="" fill sizes="144px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Breadcrumb + main */}
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6 md:px-10 md:pt-14">
        <nav
          className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-white/45 sm:text-[11px]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-brand-gold">
            Talé
          </Link>
          <span className="text-brand-gold/40">/</span>
          <Link href="/#sanctuaries" className="transition-colors hover:text-brand-gold">
            Sanctuaries
          </Link>
          <span className="text-brand-gold/40">/</span>
          <span className="max-w-[min(100%,12rem)] truncate text-brand-gold/90 sm:max-w-none">{property.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          {/* Story + amenities */}
          <div className="space-y-14 lg:col-span-7">
            <motion.section
              initial={motionOff ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={motionOff ? { duration: 0 } : springSoft}
            >
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-gold" aria-hidden />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.35em] text-brand-gold/90">The experience</h2>
              </div>
              <p className="font-serif text-xl font-light leading-relaxed text-brand-white/90 sm:text-2xl md:text-[1.65rem] md:leading-[1.55]">
                {property.description ||
                  "Indulge in an uninterrupted coastal escape tailored to your stay — panoramic views, refined interiors, and the calm rhythm of the Red Sea."}
              </p>
            </motion.section>

            <motion.section
              initial={motionOff ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={motionOff ? { duration: 0 } : { ...springSoft, delay: 0.05 }}
            >
              <h2 className="mb-8 text-[11px] font-bold uppercase tracking-[0.35em] text-brand-gold/90">Amenities</h2>
              {property.amenities && property.amenities.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity: string, idx: number) => {
                    const Icon = AMENITY_ICONS[amenity] || Coffee;
                    return (
                      <li
                        key={`${amenity}-${idx}`}
                        className="flex items-start gap-4 rounded-2xl border border-brand-gold/20 bg-brand-teal/35 px-5 py-4 transition-colors hover:border-brand-gold/45 hover:bg-brand-teal/50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-charcoal/60 text-brand-gold">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="pt-1.5 text-sm font-medium leading-snug text-brand-white/90">{amenity}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl border border-brand-white/10 bg-brand-teal/20 px-5 py-4 text-sm text-brand-white/55">
                  Amenities will appear here once configured. Standard Talé comforts apply across all suites.
                </p>
              )}
            </motion.section>

            {bookedDates.length > 0 && (
              <motion.section
                initial={motionOff ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={motionOff ? { duration: 0 } : { ...springSoft, delay: 0.08 }}
                className="border-t border-brand-gold/15 pt-14"
              >
                <h2 className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-brand-gold/90">
                  <Calendar className="h-4 w-4 text-brand-gold" aria-hidden />
                  Held dates
                </h2>
                <p className="mb-6 max-w-xl text-sm leading-relaxed text-brand-white/55">
                  The nights below are already reserved. Choose open dates for your stay.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(bookedDates))
                    .sort()
                    .map((dateStr, idx) => {
                      const dateObj = new Date(dateStr);
                      dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-charcoal/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-white/75"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow/90" aria-hidden />
                          {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      );
                    })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Booking — glass card, home hero parity */}
          <div className="lg:col-span-5">
            <motion.div
              initial={motionOff ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={motionOff ? { duration: 0 } : { ...springSoft, delay: 0.06 }}
              className="sticky top-28 rounded-[2rem] border border-brand-gold/30 bg-white/[0.07] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:top-32 sm:p-8 md:top-36 md:p-10"
            >
              <div className="mb-8 border-b border-brand-gold/20 pb-8">
                <p className="font-serif text-4xl font-light text-brand-white md:text-[2.75rem]">
                  {property.basePrice}{" "}
                  <span className="text-base font-bold uppercase tracking-[0.25em] text-brand-gold/90">EGP</span>
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-white/45">per night</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-brand-white/15 bg-brand-charcoal/50 p-3 transition-colors focus-within:border-brand-gold/40 focus-within:bg-brand-charcoal/70 sm:p-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/75">Arrival</label>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="mt-3 w-full cursor-pointer bg-transparent text-sm font-medium text-brand-white focus:outline-none"
                    />
                  </div>
                  <div className="rounded-2xl border border-brand-white/15 bg-brand-charcoal/50 p-3 transition-colors focus-within:border-brand-gold/40 focus-within:bg-brand-charcoal/70 sm:p-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/75">Departure</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="mt-3 w-full cursor-pointer bg-transparent text-sm font-medium text-brand-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-white/15 bg-brand-charcoal/50 p-3 transition-colors focus-within:border-brand-gold/40 focus-within:bg-brand-charcoal/70 sm:p-4">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/75">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-3 w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-brand-white focus:outline-none"
                  >
                    {[...Array(property.capacity || 2)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-brand-charcoal text-brand-white">
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {guestToken && (
                  <div className="rounded-2xl border border-brand-white/15 bg-brand-charcoal/50 p-3 sm:p-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/75">
                      Phone (reservation)
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="mt-3 w-full bg-transparent text-sm font-medium text-brand-white placeholder:text-brand-white/35 focus:outline-none"
                      placeholder="+20…"
                      required
                    />
                  </div>
                )}

                {!openForBooking && (
                  <p className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3 text-xs leading-relaxed text-brand-yellow-light">
                    This suite is not open for booking yet. Browse other sanctuaries or check back later.
                  </p>
                )}

                {guestToken ? (
                  <p className="rounded-2xl border border-brand-gold/25 bg-brand-teal/30 px-4 py-3 text-xs leading-relaxed text-brand-white/80">
                    You are signed in. After approval, complete payment from your{" "}
                    <Link
                      href={guestSignInUrl(pathname)}
                      className="font-semibold text-brand-gold underline-offset-2 hover:underline"
                    >
                      guest portal
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-brand-white/55">
                    <Link
                      href={guestSignInUrl(pathname)}
                      className="font-semibold text-brand-gold underline-offset-2 hover:underline"
                    >
                      Sign in to the guest portal
                    </Link>{" "}
                    to submit a reservation request.
                  </p>
                )}

                {hasConflict && (
                  <motion.div
                    initial={motionOff ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-3 rounded-2xl border border-red-500/35 bg-red-950/40 p-4 text-red-100"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
                    <p className="text-xs font-medium leading-relaxed">
                      Those dates are not available. Please choose another range.
                    </p>
                  </motion.div>
                )}

                {arrivalDate && departureDate && (
                  <motion.div
                    initial={motionOff ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3 border-t border-brand-gold/15 pt-5 text-sm"
                  >
                    <div className="flex justify-between text-brand-white/65">
                      <span>
                        {property.basePrice} EGP × {nights} nights
                      </span>
                      <span className="text-brand-white">{totalPrice} EGP</span>
                    </div>
                    <div className="flex justify-between text-brand-white/65">
                      <span>Taxes & fees (14%)</span>
                      <span>{Math.round(totalPrice * 0.14)} EGP</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-gold/20 pt-4 font-serif text-lg text-brand-white">
                      <span>Total</span>
                      <span>{Math.round(totalPrice * 1.14)} EGP</span>
                    </div>
                  </motion.div>
                )}

                <button
                  type="button"
                  disabled={
                    isProcessing ||
                    !arrivalDate ||
                    !departureDate ||
                    hasConflict ||
                    !guestToken ||
                    !openForBooking ||
                    !guestPhone.trim()
                  }
                  onClick={async () => {
                    setIsProcessing(true);
                    setPaymentError(null);
                    setRequestSuccess(null);
                    try {
                      const reqRes = await fetch(apiUrl("/api/inventory/reservation-request"), {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${guestToken}`,
                        },
                        body: JSON.stringify({
                          propertyId: id,
                          arrival: arrivalDate,
                          departure: departureDate,
                          guestPhone: guestPhone.trim(),
                        }),
                      });
                      const data = await reqRes.json();
                      if (!reqRes.ok) {
                        if (shouldRedirectGuestToSignIn(reqRes, data)) {
                          router.push(guestSignInUrl(pathname));
                          setIsProcessing(false);
                          return;
                        }
                        setPaymentError(data.message || data.error || "Request could not be submitted.");
                        setIsProcessing(false);
                        return;
                      }
                      setRequestSuccess(
                        "Request received. After an administrator approves it, complete payment from your guest portal."
                      );
                    } catch {
                      setPaymentError("Request failed. Check your connection and try again.");
                    }
                    setIsProcessing(false);
                  }}
                  className={`group mt-2 flex w-full items-center justify-center gap-3 rounded-full py-4 text-xs font-bold uppercase tracking-[0.22em] shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal disabled:cursor-not-allowed disabled:opacity-45 ${
                    hasConflict
                      ? "bg-red-800 text-white hover:bg-red-700"
                      : "bg-brand-gold text-brand-charcoal hover:bg-brand-yellow"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : !hasConflict ? (
                    <Calendar className="h-4 w-4 transition-transform group-hover:scale-105" aria-hidden />
                  ) : null}
                  {hasConflict ? "Dates unavailable" : isProcessing ? "Submitting…" : "Request reservation"}
                </button>

                {requestSuccess && (
                  <p className="text-center text-sm text-emerald-300/95" role="status">
                    {requestSuccess}
                  </p>
                )}
                {paymentError && (
                  <p className="text-center text-sm text-red-300" role="alert">
                    {paymentError}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
