"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

export default function AboutTaleSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("about");

  return (
    <section id="about" className="relative bg-brand-charcoal py-24 sm:py-32 md:py-44 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" aria-hidden />

      {/* Off-grid decorative accents — brand-aligned editorial layout */}
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 0.75, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1 }}
        aria-hidden
        className="hidden md:block absolute left-0 lg:left-6 top-24 w-40 lg:w-56 xl:w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-brand-gold/20 shadow-[0_40px_80px_rgba(0,0,0,0.5)] rotate-[-4deg]"
      >
        <Image
          src="/images/Stock/Modern Infinity Pool.webp"
          alt=""
          fill
          sizes="(max-width: 1280px) 14rem, 16rem"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-brand-charcoal/15 to-transparent" />
      </motion.div>

      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 0.8, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1, delay: 0.15 }}
        aria-hidden
        className="hidden md:block absolute right-0 lg:right-6 bottom-24 w-44 lg:w-60 xl:w-72 aspect-[4/5] rounded-2xl overflow-hidden border border-brand-gold/20 shadow-[0_40px_80px_rgba(0,0,0,0.5)] rotate-[3deg]"
      >
        <Image
          src="/images/Stock/Serene Breakfast Setup.webp"
          alt=""
          fill
          sizes="(max-width: 1280px) 15rem, 18rem"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/55 via-brand-charcoal/15 to-brand-charcoal/45" />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative">
        <motion.div {...reveal} className="max-w-4xl mx-auto text-center">
          <SectionLabel className="mb-8">{t("label")}</SectionLabel>
          <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-10 sm:mb-14">
            {t("heading")} <span className="italic text-brand-gold">{t("headingAccent")}</span> {t("headingSuffix")}
          </h2>
          <p className="text-brand-white/75 text-lg sm:text-xl md:text-2xl leading-relaxed font-light">
            {t.rich("body", {
              brand: (chunks) => (
                <span className="text-brand-gold/90 font-semibold tracking-wide">{chunks}</span>
              ),
            })}
          </p>
          <motion.p
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.2 }}
            className="mt-10 text-brand-gold text-xl sm:text-2xl md:text-3xl font-serif italic leading-relaxed"
          >
            {t("closing")}
          </motion.p>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" aria-hidden />
    </section>
  );
}
