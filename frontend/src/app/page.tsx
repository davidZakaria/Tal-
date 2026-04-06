"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Users, CheckCircle2, Menu, X } from "lucide-react";
import Image from "next/image";
import { SiteLogo } from "@/components/SiteLogo";
import { useProperties } from "@/hooks/useProperties";
import { useRouter } from "next/navigation";
import {
  setBookingIntent,
  getBookingIntent,
  propertyHrefWithIntent,
  type BookingIntent,
} from "@/lib/bookingIntent";

const NAV_LINKS = ["Sanctuaries", "Dining", "Wellness", "Experiences"] as const;

/** Hero poster / video fallback: luxury infinity pool and open sea (replace with `/hero.mp4` or your own asset in `public/`). */
const HERO_POSTER =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80";

const springReveal = {
  type: "spring" as const,
  damping: 25,
  stiffness: 120,
};

function useScrollReveal(reduceMotion: boolean | null) {
  const off = reduceMotion === true;
  return {
    initial: off ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" as const },
    transition: off ? { duration: 0 } : springReveal,
  };
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Suites");
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const { data: dbProperties, isLoading } = useProperties();
  const router = useRouter();
  const scrollReveal = useScrollReveal(reduceMotion);

  const scrollToSanctuaries = useCallback(() => {
    document.getElementById("sanctuaries")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [heroBookingError, setHeroBookingError] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    setCheckIn(start.toISOString().split("T")[0]);
    setCheckOut(end.toISOString().split("T")[0]);
  }, []);

  const maxGuestOptions = useMemo(() => {
    const caps = (dbProperties || []).map((p) => p.capacity || 2);
    const maxCap = caps.length ? Math.max(...caps, 12) : 12;
    return Math.min(Math.max(maxCap, 2), 24);
  }, [dbProperties]);

  const validateHeroDates = useCallback((ci: string, co: string): string | null => {
    if (!ci || !co) return "Select check-in and check-out.";
    const a = new Date(ci);
    const b = new Date(co);
    if (a > b) return "Check-out must be on or after check-in.";
    return null;
  }, []);

  const intentForSanctuaryClick = useCallback((): BookingIntent | null => {
    if (checkIn && checkOut && !validateHeroDates(checkIn, checkOut)) {
      return { checkIn, checkOut, guests };
    }
    return getBookingIntent();
  }, [checkIn, checkOut, guests, validateHeroDates]);

  const handleCheckAvailability = () => {
    setHeroBookingError(null);
    const err = validateHeroDates(checkIn, checkOut);
    if (err) {
      setHeroBookingError(err);
      return;
    }
    const intent: BookingIntent = { checkIn, checkOut, guests };
    setBookingIntent(intent);
    const list = (dbProperties || []).filter(
      (p) => p.openForBooking !== false && (p.capacity || 2) >= guests
    );
    if (list.length > 0) {
      router.push(propertyHrefWithIntent(list[0]._id, intent));
      return;
    }
    scrollToSanctuaries();
    setHeroBookingError(
      "No listed suite matches your party size from the home list. Scroll to choose a suite or adjust guests."
    );
  };

  const heroY = useTransform(scrollY, [0, 1000], [0, reduceMotion ? 0 : 300]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const properties = (dbProperties || []).filter(
    (p) => activeCategory === "All Suites" || p.roomType === activeCategory
  );

  const navLinkClass = (scrolled: boolean) =>
    `text-xs uppercase tracking-[0.25em] font-bold cursor-pointer transition-all duration-500 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
      scrolled
        ? "text-brand-white/85 hover:text-brand-gold ring-offset-brand-teal"
        : "text-white/80 hover:text-brand-gold ring-offset-transparent"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 1.2 }}
      className="min-h-screen min-w-0 overflow-x-hidden bg-brand-charcoal text-brand-white font-sans selection:bg-brand-gold/30"
    >
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-700 ${
          isScrolled ? "bg-brand-teal shadow-lg shadow-black/20 py-4" : "bg-transparent py-8"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center gap-2 sm:gap-4 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center"
          >
            <SiteLogo
              href="/"
              variant={isScrolled ? "onLight" : "onDark"}
              wrapperClassName="h-16 w-48 sm:h-20 sm:w-56 md:h-28 md:w-72"
              priority
            />
          </motion.div>

          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.2 + i * 0.1,
                  duration: reduceMotion ? 0 : 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={navLinkClass(isScrolled)}
              >
                {link}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            <button
              type="button"
              className={`md:hidden rounded-full p-2.5 sm:p-3 border backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                isScrolled
                  ? "border-brand-white/20 bg-brand-teal text-brand-white hover:bg-brand-forest"
                  : "border-white/30 bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.6, duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => router.push("/portal")}
              className={`px-3.5 py-2.5 sm:px-6 md:px-8 sm:py-3 md:py-3.5 font-bold text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.2em] uppercase transition-all duration-500 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 whitespace-nowrap ${
                isScrolled
                  ? "bg-brand-gold/90 text-brand-charcoal hover:bg-brand-yellow hover:shadow-lg ring-offset-brand-teal"
                  : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-brand-gold hover:text-brand-charcoal ring-offset-transparent"
              }`}
            >
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">Guest Portal</span>
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-brand-white/10 bg-brand-teal backdrop-blur-md"
            >
              <div className="container mx-auto px-6 py-8 flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-sm uppercase tracking-[0.2em] font-bold text-brand-white/90 py-2 border-b border-brand-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative min-h-[100dvh] min-h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 scale-[1.08] sm:scale-110 min-w-0">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
            aria-label="Resort pool and sea"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-[1] bg-black/50" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-brand-teal/90 via-black/45 to-transparent" />
          <div className="absolute inset-0 z-[2] bg-noise-overlay pointer-events-none" aria-hidden />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[100dvh] min-h-screen text-center text-white pt-20 sm:pt-24 pb-40 sm:pb-48 pointer-events-none">
          <motion.section {...scrollReveal} className="flex flex-col items-center max-w-5xl w-full min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 1.2,
                delay: reduceMotion ? 0 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.35em] uppercase mb-6 sm:mb-8 text-brand-gold drop-shadow-md px-2"
            >
              Galala City • Red Sea
            </motion.p>

            <h1 className="text-[clamp(2.25rem,8.5vw,3.5rem)] sm:text-7xl md:text-[10rem] font-serif font-light tracking-tighter mb-8 sm:mb-10 drop-shadow-2xl leading-[0.92] px-1 flex flex-col items-center max-w-[100%]">
              <span className="overflow-hidden block pb-2">
                <motion.span
                  initial={{ y: reduceMotion ? 0 : "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 1.4,
                    delay: reduceMotion ? 0 : 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block"
                >
                  Soul of
                </motion.span>
              </span>
              <span className="overflow-hidden block pb-4">
                <motion.span
                  initial={{ y: reduceMotion ? 0 : "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 1.4,
                    delay: reduceMotion ? 0 : 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block text-brand-white/90 italic pr-4"
                >
                  a Resort.
                </motion.span>
              </span>
            </h1>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
          className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-12 md:bottom-16 left-0 right-0 z-20 px-3 sm:px-4 md:px-6 pointer-events-auto"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-2xl sm:rounded-3xl md:rounded-[2rem] border border-brand-gold/30 bg-white/10 p-2 md:p-3 backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.45)] max-w-[min(100%,calc(100vw-2rem))] mx-auto">
              <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 md:gap-2 w-full min-w-0">
                <div className="flex-1 flex max-md:w-full items-start gap-4 hover:bg-white/5 p-4 md:px-6 rounded-2xl md:rounded-full border border-transparent transition-colors min-w-0">
                  <Calendar className="text-brand-gold w-6 h-6 shrink-0 mt-1" aria-hidden />
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs text-brand-white/60 uppercase tracking-[0.2em] font-bold">Itinerary</p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <label className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-brand-white/45 font-bold">
                          Check-in
                        </span>
                        <input
                          type="date"
                          value={checkIn}
                          min={todayStr}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            setHeroBookingError(null);
                          }}
                          className="w-full rounded-xl border border-brand-white/25 bg-white/95 px-2.5 py-2 text-xs font-semibold text-brand-charcoal shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        />
                      </label>
                      <label className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-brand-white/45 font-bold">
                          Check-out
                        </span>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || todayStr}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            setHeroBookingError(null);
                          }}
                          className="w-full rounded-xl border border-brand-white/25 bg-white/95 px-2.5 py-2 text-xs font-semibold text-brand-charcoal shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-px self-stretch min-h-[4.5rem] bg-brand-white/15 shrink-0" />

                <div className="flex-1 flex max-md:w-full items-start gap-4 hover:bg-white/5 p-4 md:px-6 rounded-2xl md:rounded-full border border-transparent transition-colors min-w-0">
                  <Users className="text-brand-gold w-6 h-6 shrink-0 mt-1" aria-hidden />
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs text-brand-white/60 uppercase tracking-[0.2em] font-bold">Target Class</p>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-brand-white/45 font-bold">
                        Guests
                      </span>
                      <select
                        value={guests}
                        onChange={(e) => {
                          setGuests(Number(e.target.value));
                          setHeroBookingError(null);
                        }}
                        className="w-full rounded-xl border border-brand-white/25 bg-white/95 px-2.5 py-2 text-xs font-semibold text-brand-charcoal shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
                      >
                        {Array.from({ length: maxGuestOptions }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  className="bg-brand-gold text-brand-charcoal px-10 py-5 rounded-2xl md:rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-yellow transition-all duration-500 max-md:w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal shrink-0 md:self-stretch md:flex md:items-center md:justify-center"
                >
                  Check Availability
                </button>
              </div>
              {heroBookingError && (
                <p
                  className="text-xs text-brand-yellow/95 px-3 md:px-4 pb-3 pt-1 text-center md:text-left leading-relaxed"
                  role="status"
                >
                  {heroBookingError}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="sanctuaries" className="relative z-20 overflow-hidden bg-brand-charcoal pt-16 sm:pt-24 pb-24 sm:pb-32 md:pb-40">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 min-w-0">
          <motion.div {...scrollReveal} className="max-w-4xl mb-12 sm:mb-20 md:mb-32 md:pl-8">
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif text-brand-gold font-light tracking-tight mb-6 sm:mb-10 [letter-spacing:0.02em] break-words">
              A Tactile Haven
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-brand-white/75 leading-relaxed font-light max-w-2xl">
              Designed as a seamless extension of the coastal lifestyle, Talé brings together curated service and
              uninterrupted views of the Red Sea.
            </p>
          </motion.div>

          <motion.div
            {...scrollReveal}
            className="md:pl-8 mb-12 md:mb-16 lg:mb-24 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap sm:flex-wrap gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-0 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs font-bold [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {["All Suites", "Signature Suite", "Ocean Villa", "Penthouse", "Alpine Chalet", "Standard Room"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-full transition-all border ${
                    activeCategory === cat
                      ? "bg-brand-gold/15 text-brand-gold border-brand-gold/50 shadow-[0_10px_30px_rgba(201,168,106,0.2)]"
                      : "bg-transparent text-brand-white/50 border-brand-gold/25 hover:border-brand-gold/45 hover:text-brand-white/80"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </motion.div>

          <motion.div layout className="relative flex flex-col gap-16 md:gap-28 items-center w-full">
            {isLoading && (
              <div className="w-full flex flex-col gap-16 md:gap-24" aria-busy="true" aria-label="Loading properties">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 animate-pulse rounded-[2.5rem] md:rounded-[3rem] bg-brand-teal/40 p-6 md:p-10"
                  >
                    <div className="w-full md:w-[58%] min-h-[360px] md:h-[560px] rounded-[2rem] md:rounded-[3rem] bg-brand-white/10" />
                    <div className="w-full md:w-[42%] space-y-6 px-2">
                      <div className="h-4 w-32 rounded-full bg-brand-gold/20" />
                      <div className="h-14 w-3/4 rounded-lg bg-brand-white/10" />
                      <div className="h-24 w-full rounded-lg bg-brand-white/10" />
                      <div className="h-10 w-40 rounded-full bg-brand-gold/15" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && properties.length === 0 && (
              <motion.div
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-32 text-center px-4 rounded-[2rem] border border-brand-gold/20 bg-brand-teal/30"
              >
                <p className="text-brand-white/70 font-medium text-lg md:text-xl mb-6">
                  No suites match <span className="text-brand-gold font-serif">{activeCategory}</span> yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory("All Suites")}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-brand-gold border border-brand-gold/40 px-8 py-3 rounded-full hover:bg-brand-gold/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  View all suites
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {properties.map((prop, i) => {
                const band = i % 2 === 0 ? "bg-brand-teal/90" : "bg-brand-charcoal";
                const staggerX = i % 2 === 0 ? "md:translate-x-4 lg:translate-x-8" : "md:-translate-x-4 lg:-translate-x-8";
                const rowMotion = {
                  initial: reduceMotion
                    ? { opacity: 1, y: 0, x: 0 }
                    : { opacity: 0, y: 28, x: i % 2 === 0 ? -20 : 20 },
                  whileInView: { opacity: 1, y: 0, x: 0 },
                  viewport: { once: true, margin: "-80px" as const },
                  transition: reduceMotion ? { duration: 0 } : { ...springReveal, delay: 0.05 * i },
                };
                return (
                  <motion.div
                    layout
                    key={prop._id}
                    {...rowMotion}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    onClick={() => {
                      const intent = intentForSanctuaryClick();
                      if (intent) setBookingIntent(intent);
                      router.push(propertyHrefWithIntent(prop._id, intent));
                    }}
                    className={`group cursor-pointer w-full max-w-6xl rounded-2xl sm:rounded-[2.5rem] md:rounded-[3.5rem] p-4 sm:p-6 md:p-10 lg:p-12 ${band} border border-brand-white/5 shadow-2xl shadow-black/30 min-w-0`}
                  >
                    <div
                      className={`flex flex-col md:flex-row items-stretch md:items-center gap-8 sm:gap-10 md:gap-14 lg:gap-20 ${
                        i % 2 === 1 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-full md:w-[58%] relative min-h-[260px] sm:min-h-[340px] md:h-[580px] overflow-hidden rounded-xl sm:rounded-[2rem] md:rounded-[3rem] shadow-2xl transition-transform duration-500 ${staggerX}`}
                      >
                        <Image
                          src={
                            prop.images && prop.images[0]
                              ? prop.images[0]
                              : "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                          }
                          alt={prop.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 58vw"
                          className="object-cover transition-transform duration-[2.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-brand-forest/20 group-hover:bg-transparent transition-colors duration-1000 mix-blend-multiply" />

                        {prop.isOccupiedToday && (
                          <div className="absolute top-3 left-3 right-3 sm:top-8 sm:left-8 sm:right-auto z-20 bg-brand-charcoal/95 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl sm:rounded-full border border-brand-gold/30 flex items-center gap-2 sm:gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-white leading-tight">
                              Private Party Occupied
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-[42%] flex flex-col items-start px-1 md:px-2">
                        <div className="flex flex-wrap items-center gap-4 mb-6 md:mb-10">
                          <span className="px-5 py-2 rounded-full border border-brand-gold/35 text-xs uppercase tracking-widest font-bold text-brand-gold/90">
                            {prop.roomType || "Signature Suite"}
                          </span>
                          <span className="text-xs uppercase tracking-widest font-bold text-brand-white/45 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-brand-gold/50" /> Up to {prop.capacity || 2} Guests
                          </span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-brand-white font-light mb-6 leading-[1.1] tracking-tight group-hover:text-brand-gold transition-colors duration-500 break-words">
                          {prop.name}
                        </h3>

                        <p className="text-brand-white/65 text-sm md:text-base leading-[1.8] font-light mb-12 line-clamp-4">
                          {prop.description ||
                            "Designed as a seamless extension of the coastal lifestyle, bridging curated personal service with purely uninterrupted views of the Red Sea."}
                        </p>

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between w-full border-t border-brand-gold/20 pt-6 sm:pt-8 mt-auto">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-brand-white/45 font-bold mb-1">
                              Starting Rate
                            </p>
                            <p className="text-xl sm:text-2xl font-serif text-brand-gold">
                              {prop.basePrice}{" "}
                              <span className="text-xs font-sans uppercase tracking-[0.2em] text-brand-white/50 ml-1">
                                EGP
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-brand-white group-hover:text-brand-gold transition-colors duration-500">
                            <span className="sm:hidden">Explore</span>
                            <span className="hidden sm:inline">Explore Sanctuary</span>
                            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-brand-gold/30 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-charcoal transition-all duration-500 shadow-sm shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <motion.section
        {...scrollReveal}
        className="py-16 sm:py-24 md:py-40 bg-brand-teal relative border-t border-brand-gold/10"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-10 sm:gap-16 md:gap-20 min-w-0">
          <motion.div
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.2 }}
            className="md:w-5/12 relative aspect-[4/5] w-full max-w-md mx-auto rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-2xl border border-brand-gold/15"
          >
            <Image
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              alt="Signature Experience"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-noise-overlay pointer-events-none opacity-50" aria-hidden />
          </motion.div>
          <div className="md:w-7/12 w-full text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif text-brand-gold font-light mb-6 sm:mb-10 tracking-tight leading-tight text-balance">
              Every stay is a signature.
            </h2>
            <p className="text-base sm:text-xl text-brand-white/75 mb-8 sm:mb-12 font-light leading-relaxed max-w-xl mx-auto md:mx-0">
              Whether for a weekend retreat or an annual escape, we ensure a pristine canvas for your most memorable
              moments by the sea.
            </p>
            <ul className="space-y-4 sm:space-y-6 text-left">
              {["Uninterrupted Panoramic Views", "Curated Personal Service", "Rhythmic Ocean Design"].map((item, idx) => (
                <motion.li
                  key={item}
                  initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.15, duration: 0.8 }}
                  className="flex items-start sm:items-center gap-4 sm:gap-6 text-brand-white font-medium tracking-wide text-base sm:text-lg"
                >
                  <CheckCircle2 className="w-6 h-6 text-brand-gold shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
