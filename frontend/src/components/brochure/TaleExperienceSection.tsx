"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

export default function TaleExperienceSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("experience");

  return (
    <section id="experience" className="relative bg-brand-forest py-24 sm:py-32 md:py-44 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-14 items-center">
          <motion.div
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1 }}
            className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none"
          >
            {/* Main editorial image */}
            <div className="relative aspect-[4/5] w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-brand-gold/20 shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
              <Image
                src="/images/Stock/Serene Oceanview Bedroom.png"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-forest/55 via-transparent to-brand-gold/5 mix-blend-multiply" />
              <div className="absolute inset-0 bg-noise-overlay opacity-40 pointer-events-none" aria-hidden />
            </div>
          </motion.div>

          <motion.div {...reveal} className="lg:col-span-7">
            <SectionLabel className="mb-6">{t("label")}</SectionLabel>
            <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-8">
              {t("heading")} <span className="italic text-brand-gold">{t("headingAccent")}</span>
            </h2>
            <p className="text-brand-white/80 text-lg sm:text-xl md:text-2xl leading-relaxed font-light max-w-2xl">
              {t.rich("body1", {
                brand: (chunks) => <span className="text-brand-gold font-semibold">{chunks}</span>,
              })}
            </p>
            <p className="mt-6 text-brand-white/70 text-base sm:text-lg leading-relaxed font-light max-w-2xl">
              {t("body2")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
