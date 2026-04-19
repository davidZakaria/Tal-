"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

const GALLERY = [
  "/images/jurasokhna/01.webp",
  "/images/jurasokhna/C12-01.webp",
] as const;

export default function JuraSokhnaSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("juraSokhna");
  const galleryAlts = t.raw("galleryAlts") as string[];

  return (
    <section
      id="jurasokhna"
      className="relative bg-brand-teal/40 py-24 sm:py-32 md:py-44 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/35 to-transparent" aria-hidden />
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <motion.div {...reveal} className="max-w-4xl mx-auto text-center mb-14 sm:mb-20 md:mb-24">
          <SectionLabel className="mb-8">{t("label")}</SectionLabel>
          <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-8 sm:mb-10">
            {t("heading")}{" "}
            <span className="italic text-brand-gold">{t("headingAccent")}</span>
            {t("headingSuffix")
              ? (
                  <>
                    {" "}
                    {t("headingSuffix")}
                  </>
                )
              : null}
          </h2>
          <p className="text-brand-white/80 text-lg sm:text-xl md:text-2xl leading-relaxed font-light">
            {t.rich("body", {
              brand: (chunks) => (
                <span className="text-brand-gold/95 font-semibold tracking-wide">{chunks}</span>
              ),
              project: (chunks) => (
                <span className="text-brand-white font-medium">{chunks}</span>
              ),
              developer: (chunks) => (
                <span className="text-brand-gold/90 font-semibold">{chunks}</span>
              ),
            })}
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto"
        >
          {GALLERY.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] sm:aspect-[3/4] rounded-2xl md:rounded-[1.75rem] overflow-hidden border border-brand-gold/20 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            >
              <Image
                src={src}
                alt={galleryAlts[i] ?? ""}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-transparent pointer-events-none" aria-hidden />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" aria-hidden />
    </section>
  );
}
