"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

const ITEM_KEYS = ["suites", "duplex", "apartment"] as const;

const IMAGES: Record<(typeof ITEM_KEYS)[number], string> = {
  suites: "/images/interiors/suite.jpeg",
  duplex: "/images/interiors/Duplex.jpeg",
  apartment: "/images/interiors/hotel-apartment.jpeg",
};

export default function AccommodationsCarousel() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("accommodations");

  const items = ITEM_KEYS.map((key) => ({
    key,
    label: t(`items.${key}.label`),
    title: t(`items.${key}.title`),
    description: t(`items.${key}.description`),
    image: IMAGES[key],
  }));

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      const base = isRtl
        ? child.offsetLeft - el.clientWidth + child.clientWidth + 24
        : child.offsetLeft - 24;
      el.scrollTo({ left: base, behavior: "smooth" });
    }
  }, [isRtl, items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      if (isRtl) {
        const viewportRight = Math.abs(el.scrollLeft) + el.clientWidth - 40;
        let idx = 0;
        for (let i = 0; i < children.length; i += 1) {
          const rightEdge = children[i].offsetLeft + children[i].clientWidth;
          if (rightEdge <= viewportRight) idx = i;
        }
        setActive(idx);
      } else {
        const scrollLeft = el.scrollLeft + 40;
        let idx = 0;
        for (let i = 0; i < children.length; i += 1) {
          if (children[i].offsetLeft <= scrollLeft) idx = i;
        }
        setActive(idx);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isRtl]);

  return (
    <section id="accommodations" className="relative bg-brand-charcoal py-24 sm:py-32 md:py-44 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <motion.div {...reveal} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10 sm:mb-16">
          <div className="max-w-2xl">
            <SectionLabel className="mb-5">{t("label")}</SectionLabel>
            <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight">
              {t("heading")} <span className="italic text-brand-gold">{t("headingAccent")}</span>
            </h2>
          </div>
          <div className="flex gap-3 self-start md:self-end">
            <button
              type="button"
              aria-label={t("prev")}
              onClick={() => scrollTo(active - 1)}
              className="w-12 h-12 rounded-full border border-brand-gold/35 text-brand-gold hover:bg-brand-gold hover:text-brand-charcoal transition-colors duration-500 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => scrollTo(active + 1)}
              className="w-12 h-12 rounded-full border border-brand-gold/35 text-brand-gold hover:bg-brand-gold hover:text-brand-charcoal transition-colors duration-500 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>
        </motion.div>
      </div>

      <div
        ref={trackRef}
        className="group/track flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scroll-px-6 md:scroll-px-12 ps-4 sm:ps-6 md:ps-12 pe-4 sm:pe-6 md:pe-12 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, idx) => (
          <motion.article
            key={item.key}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: idx * 0.1 }}
            className="snap-start shrink-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[48%] relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-brand-gold/20 bg-brand-forest shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-[4/5] md:aspect-[3/4] w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 48vw"
                className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/30 to-transparent" />
              <div className="absolute inset-0 bg-noise-overlay opacity-40 pointer-events-none" aria-hidden />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 flex flex-col gap-3">
              <SectionLabel tone="gold">{item.label}</SectionLabel>
              <h3 className="font-serif font-light text-brand-white text-3xl sm:text-4xl md:text-5xl leading-tight">
                {item.title}
              </h3>
              <p className="text-brand-white/80 text-sm sm:text-base leading-relaxed max-w-md">{item.description}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 mt-4 flex items-center gap-3">
        {items.map((a, idx) => (
          <button
            key={a.key}
            type="button"
            onClick={() => scrollTo(idx)}
            aria-label={t("jumpTo", { title: a.title })}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              active === idx ? "w-14 bg-brand-gold" : "w-8 bg-brand-white/25 hover:bg-brand-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
