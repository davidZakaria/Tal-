"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Users, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/SiteLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useProperties } from "@/hooks/useProperties";
import {
  getBookingIntent,
  propertyHrefWithIntent,
  type BookingIntent,
} from "@/lib/bookingIntent";
import { scrollRevealProps, brochureSpring } from "@/lib/brochureMotion";
import BrochureHero from "@/components/brochure/BrochureHero";
import AboutTaleSection from "@/components/brochure/AboutTaleSection";
import JuraSokhnaSection from "@/components/brochure/JuraSokhnaSection";
import ServicesBentoSection from "@/components/brochure/ServicesBentoSection";
import AccommodationsCarousel from "@/components/brochure/AccommodationsCarousel";
import TaleExperienceSection from "@/components/brochure/TaleExperienceSection";
import LifestyleMosaicSection from "@/components/brochure/LifestyleMosaicSection";
import MembershipSection from "@/components/brochure/MembershipSection";
import PricingLeadSection from "@/components/brochure/PricingLeadSection";
import { SectionLabel } from "@/components/brochure/SectionLabel";

const NAV_KEYS = ["about", "services", "stays", "experience", "membership", "suites"] as const;
const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  about: "#about",
  services: "#services",
  stays: "#accommodations",
  experience: "#experience",
  membership: "#membership",
  suites: "#suites",
};

const CATEGORY_KEYS = ["all", "signature", "ocean", "penthouse", "alpine", "standard"] as const;
const CATEGORY_TO_ROOM_TYPE: Record<(typeof CATEGORY_KEYS)[number], string> = {
  all: "All Suites",
  signature: "Signature Suite",
  ocean: "Ocean Villa",
  penthouse: "Penthouse",
  alpine: "Alpine Chalet",
  standard: "Standard Room",
};

export default function HomeClient() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tInv = useTranslations("inventory");

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategoryKey, setActiveCategoryKey] =
    useState<(typeof CATEGORY_KEYS)[number]>("all");

  const { data: dbProperties, isLoading } = useProperties();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProperties = useMemo(
    () =>
      (dbProperties || []).filter((p) => {
        if (activeCategoryKey === "all") return true;
        return p.roomType === CATEGORY_TO_ROOM_TYPE[activeCategoryKey];
      }),
    [dbProperties, activeCategoryKey],
  );

  const intentForCardClick = useCallback((): BookingIntent | null => {
    return getBookingIntent();
  }, []);

  const navLinkClass = (scrolled: boolean) =>
    `text-[11px] uppercase tracking-[0.3em] font-bold cursor-pointer transition-all duration-500 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
      scrolled
        ? "text-brand-white/85 hover:text-brand-gold ring-offset-brand-teal"
        : "text-brand-white/90 hover:text-brand-gold ring-offset-transparent"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 1 }}
      className="min-h-screen min-w-0 overflow-x-hidden bg-brand-charcoal text-brand-white font-sans selection:bg-brand-gold/30"
    >
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
          isScrolled
            ? "bg-brand-charcoal/95 backdrop-blur-xl shadow-lg shadow-black/20 py-3 border-b border-brand-gold/10"
            : "bg-transparent py-4 sm:py-5 xl:py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 min-w-0">
          {/* Tablet / mobile: single row — utilities stay off the centered nav strip */}
          <div className="flex xl:hidden items-center justify-between gap-3 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex min-w-0 items-center shrink-0"
            >
              <SiteLogo
                href="/"
                variant="onDark"
                wrapperClassName="h-20 w-60 sm:h-24 sm:w-72 md:h-28 md:w-80"
                priority
              />
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                className="rounded-full p-2.5 border border-brand-gold/40 bg-white/10 text-brand-white hover:bg-brand-gold hover:text-brand-charcoal transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav"
                aria-label={mobileNavOpen ? tNav("closeMenu") : tNav("openMenu")}
                onClick={() => setMobileNavOpen((o) => !o)}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="hidden md:block shrink-0">
                <LanguageSwitcher variant="nav" />
              </div>

              <motion.a
                href="#presentation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.4, duration: reduceMotion ? 0 : 0.8 }}
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-3.5 md:px-5 py-2.5 md:py-3 font-bold text-[10px] md:text-[11px] tracking-[0.2em] uppercase whitespace-nowrap rounded-full bg-brand-gold/90 text-brand-charcoal hover:bg-brand-yellow hover:shadow-lg transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                {tNav("privatePresentation")}
                <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 shrink-0" />
              </motion.a>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.5, duration: reduceMotion ? 0 : 0.8 }}
                type="button"
                onClick={() => router.push("/portal")}
                className="shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 font-bold text-[10px] sm:text-[11px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 rounded-full border border-brand-white/25 text-brand-white hover:bg-brand-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                {tNav("portal")}
              </motion.button>
            </div>
          </div>

          {/* xl+: brand + utilities on row 1; section links centered on row 2 (no overlap) */}
          <div className="hidden xl:flex flex-col gap-3 w-full min-w-0">
            <div className="flex items-center justify-between gap-8 min-w-0 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center shrink-0 min-w-0"
              >
                <SiteLogo
                  href="/"
                  variant="onDark"
                  wrapperClassName="h-24 w-72 md:h-28 md:w-80 2xl:h-32 2xl:w-96"
                  priority
                />
              </motion.div>

              <div className="flex items-center gap-3 2xl:gap-4 shrink-0">
                <div className="shrink-0">
                  <LanguageSwitcher variant="nav" />
                </div>

                <motion.a
                  href="#presentation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.4, duration: reduceMotion ? 0 : 0.8 }}
                  className="inline-flex shrink-0 items-center gap-2 px-6 md:px-7 py-3 md:py-3.5 font-bold text-[11px] tracking-[0.22em] uppercase whitespace-nowrap rounded-full bg-brand-gold/90 text-brand-charcoal hover:bg-brand-yellow hover:shadow-lg transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  {tNav("privatePresentation")}
                  <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 shrink-0" />
                </motion.a>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.5, duration: reduceMotion ? 0 : 0.8 }}
                  type="button"
                  onClick={() => router.push("/portal")}
                  className="shrink-0 px-5 py-3 font-bold text-[11px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 rounded-full border border-brand-white/25 text-brand-white hover:bg-brand-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  {tNav("portal")}
                </motion.button>
              </div>
            </div>

            <div
              className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-1 pt-1 border-t ${
                isScrolled ? "border-brand-gold/15" : "border-brand-gold/10"
              }`}
            >
              {NAV_KEYS.map((key, i) => (
                <motion.a
                  key={key}
                  href={NAV_HREFS[key]}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.1 + i * 0.06,
                    duration: reduceMotion ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`${navLinkClass(isScrolled)} shrink-0`}
                >
                  {tNav(key)}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden overflow-hidden border-t border-brand-gold/20 bg-brand-charcoal/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-6 py-6 flex flex-col gap-1">
                {NAV_KEYS.map((key) => (
                  <a
                    key={key}
                    href={NAV_HREFS[key]}
                    onClick={() => setMobileNavOpen(false)}
                    className="text-sm uppercase tracking-[0.25em] font-bold text-brand-white/90 py-3 border-b border-brand-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded hover:text-brand-gold transition-colors"
                  >
                    {tNav(key)}
                  </a>
                ))}
                <div className="pt-4">
                  <LanguageSwitcher variant="mobile" />
                </div>
                <a
                  href="#presentation"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-xs tracking-[0.25em] uppercase rounded-full bg-brand-gold text-brand-charcoal"
                >
                  {tNav("privatePresentation")}
                  <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <BrochureHero />
      <AboutTaleSection />
      <JuraSokhnaSection />
      <ServicesBentoSection />
      <AccommodationsCarousel />
      <TaleExperienceSection />
      <LifestyleMosaicSection />
      <MembershipSection />
      <PricingLeadSection />

      <section
        id="suites"
        className="relative z-20 overflow-hidden bg-brand-charcoal pt-20 sm:pt-28 pb-24 sm:pb-36"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 min-w-0">
          <motion.div {...reveal} className="max-w-4xl mb-12 sm:mb-20 md:ps-2">
            <SectionLabel className="mb-6">{tInv("label")}</SectionLabel>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-brand-white font-light tracking-tight mb-6 sm:mb-10">
              {tInv("heading")} <span className="italic text-brand-gold">{tInv("headingAccent")}</span> {tInv("headingSuffix")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-brand-white/70 leading-relaxed font-light max-w-2xl">
              {tInv("intro")}
            </p>
          </motion.div>

          <motion.div
            {...reveal}
            className="mb-10 md:mb-16 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap sm:flex-wrap gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-0 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategoryKey(key)}
                className={`shrink-0 px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-full transition-all border ${
                  activeCategoryKey === key
                    ? "bg-brand-gold/15 text-brand-gold border-brand-gold/50 shadow-[0_10px_30px_rgba(201,168,106,0.2)]"
                    : "bg-transparent text-brand-white/50 border-brand-gold/25 hover:border-brand-gold/45 hover:text-brand-white/80"
                }`}
              >
                {tInv(`categories.${key}`)}
              </button>
            ))}
          </motion.div>

          <motion.div layout className="relative flex flex-col gap-16 md:gap-24 items-center w-full">
            {isLoading && (
              <div className="w-full flex flex-col gap-16 md:gap-24" aria-busy="true" aria-label={tInv("loading")}>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 animate-pulse rounded-[2rem] md:rounded-[2.5rem] bg-brand-teal/40 p-6 md:p-10"
                  >
                    <div className="w-full md:w-[58%] min-h-[320px] md:h-[500px] rounded-[1.5rem] md:rounded-[2.5rem] bg-brand-white/10" />
                    <div className="w-full md:w-[42%] space-y-5 px-2">
                      <div className="h-4 w-32 rounded-full bg-brand-gold/20" />
                      <div className="h-12 w-3/4 rounded-lg bg-brand-white/10" />
                      <div className="h-24 w-full rounded-lg bg-brand-white/10" />
                      <div className="h-10 w-40 rounded-full bg-brand-gold/15" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredProperties.length === 0 && (
              <div className="w-full py-24 text-center px-4 rounded-[2rem] border border-brand-gold/20 bg-brand-teal/30">
                <p className="text-brand-white/70 font-medium text-lg md:text-xl mb-6">
                  {tInv("empty", { category: tInv(`categories.${activeCategoryKey}`) })}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategoryKey("all")}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-brand-gold border border-brand-gold/40 px-8 py-3 rounded-full hover:bg-brand-gold/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  {tInv("viewAll")}
                </button>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {filteredProperties.map((prop, i) => {
                const band = i % 2 === 0 ? "bg-brand-teal/90" : "bg-brand-charcoal";
                const staggerX = i % 2 === 0 ? "md:translate-x-4 lg:translate-x-8" : "md:-translate-x-4 lg:-translate-x-8";
                const rowMotion = {
                  initial: reduceMotion
                    ? { opacity: 1, y: 0, x: 0 }
                    : { opacity: 0, y: 28, x: i % 2 === 0 ? -20 : 20 },
                  whileInView: { opacity: 1, y: 0, x: 0 },
                  viewport: { once: true, margin: "-80px" as const },
                  transition: reduceMotion ? { duration: 0 } : { ...brochureSpring, delay: 0.05 * i },
                };

                return (
                  <motion.div
                    layout
                    key={prop._id}
                    {...rowMotion}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    onClick={() => {
                      const intent = intentForCardClick();
                      router.push(propertyHrefWithIntent(prop._id, intent));
                    }}
                    className={`group cursor-pointer w-full max-w-6xl rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 ${band} border border-brand-white/5 shadow-2xl shadow-black/30`}
                  >
                    <div
                      className={`flex flex-col md:flex-row items-stretch md:items-center gap-8 sm:gap-10 md:gap-14 lg:gap-20 ${
                        i % 2 === 1 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-full md:w-[58%] relative min-h-[260px] sm:min-h-[340px] md:h-[500px] overflow-hidden rounded-xl sm:rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform duration-500 ${staggerX}`}
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
                          <div className="absolute top-3 start-3 end-3 sm:top-6 sm:start-6 sm:end-auto z-20 bg-brand-charcoal/95 backdrop-blur-md px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-2xl sm:rounded-full border border-brand-gold/30 flex items-center gap-2 sm:gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-white">
                              {tInv("privateOccupied")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-[42%] flex flex-col items-start px-1 md:px-2">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <span className="px-4 py-1.5 rounded-full border border-brand-gold/35 text-[11px] uppercase tracking-widest font-bold text-brand-gold/90">
                            {prop.roomType || tInv("roomDefault")}
                          </span>
                          <span className="text-[11px] uppercase tracking-widest font-bold text-brand-white/45 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-brand-gold/50" />
                            {tInv("upToGuests", { count: prop.capacity || 2 })}
                          </span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif text-brand-white font-light mb-5 leading-[1.1] tracking-tight group-hover:text-brand-gold transition-colors duration-500 break-words">
                          {prop.name}
                        </h3>

                        <p className="text-brand-white/65 text-sm md:text-base leading-[1.8] font-light mb-10 line-clamp-4">
                          {prop.description || tInv("descriptionDefault")}
                        </p>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between w-full border-t border-brand-gold/20 pt-6 mt-auto">
                          <div>
                            <p className="text-[11px] uppercase tracking-widest text-brand-white/45 font-bold mb-1">
                              {tInv("startingRate")}
                            </p>
                            <p className="text-xl sm:text-2xl font-serif text-brand-gold">
                              {prop.basePrice}{" "}
                              <span className="text-xs font-sans uppercase tracking-[0.2em] text-brand-white/50 ms-1">
                                EGP
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-bold tracking-[0.2em] uppercase text-brand-white group-hover:text-brand-gold transition-colors duration-500">
                            <span>{tInv("exploreSuite")}</span>
                            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-brand-gold/30 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-charcoal transition-all duration-500 shrink-0">
                              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
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
    </motion.div>
  );
}
