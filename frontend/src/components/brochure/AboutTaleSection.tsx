"use client";

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
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
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
