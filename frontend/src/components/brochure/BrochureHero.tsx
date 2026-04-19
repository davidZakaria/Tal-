"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { brochureEase } from "@/lib/brochureMotion";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80";

export default function BrochureHero() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, reduceMotion ? 0 : 260]);
  const t = useTranslations("hero");

  const scrollToPresentation = () => {
    document.getElementById("presentation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center">
      <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 scale-[1.08] sm:scale-110">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
          aria-label={t("videoAria")}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[1] bg-brand-forest/60" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-brand-charcoal/40 via-brand-teal/60 to-brand-forest/90" />
        <div className="absolute inset-0 z-[2] bg-noise-overlay pointer-events-none" aria-hidden />
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[100dvh] text-center text-brand-white pt-28 sm:pt-24 xl:pt-40 pb-32 sm:pb-40">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.2, ease: brochureEase }}
          className="text-[10px] sm:text-xs font-bold tracking-[0.4em] sm:tracking-[0.55em] uppercase text-brand-gold drop-shadow mb-8"
        >
          {t("eyebrow")}
        </motion.p>

        <h1 className="font-serif font-light leading-[0.95] tracking-tight text-[clamp(2.5rem,9vw,7.5rem)] max-w-[18ch] mx-auto">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: reduceMotion ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 0.1, ease: brochureEase }}
              className="block uppercase tracking-[0.16em] sm:tracking-[0.22em]"
            >
              {t("heading1")}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: reduceMotion ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 0.25, ease: brochureEase }}
              className="block italic text-brand-gold/95 tracking-[0.04em]"
            >
              {t("headingConnector")}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: reduceMotion ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 0.4, ease: brochureEase }}
              className="block uppercase tracking-[0.16em] sm:tracking-[0.22em]"
            >
              {t("heading2")}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.6, ease: brochureEase }}
          className="mt-10 sm:mt-14 text-base sm:text-xl md:text-2xl text-brand-white/85 font-light max-w-2xl leading-relaxed"
        >
          {t("subheading")}
        </motion.p>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.85, ease: brochureEase }}
          onClick={scrollToPresentation}
          className="group mt-10 sm:mt-14 inline-flex items-center gap-4 rounded-full border border-brand-gold/45 bg-white/10 px-7 sm:px-10 py-4 sm:py-5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-brand-white backdrop-blur-xl shadow-[0_30px_70px_rgba(0,0,0,0.45)] hover:bg-brand-gold hover:text-brand-charcoal hover:border-brand-gold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-forest"
        >
          {t("cta")}
          <span className="w-9 h-9 rounded-full border border-brand-gold/50 flex items-center justify-center bg-brand-gold/15 group-hover:bg-brand-charcoal group-hover:text-brand-gold transition-colors duration-500">
            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
          </span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1.4, delay: reduceMotion ? 0 : 1 }}
        className="absolute bottom-6 sm:bottom-10 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-10 flex flex-col items-center gap-3 text-brand-white/60"
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">{t("scroll")}</span>
        <span className="w-px h-12 bg-gradient-to-b from-brand-gold/80 to-transparent" />
      </motion.div>
    </section>
  );
}
