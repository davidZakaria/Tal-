"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  ConciergeBell,
  Utensils,
  ShieldCheck,
  Wrench,
  LifeBuoy,
  BedDouble,
  Waves,
  Flower2,
  Compass,
  Gem,
} from "lucide-react";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

type IconComponent = React.ComponentType<{ className?: string }>;

const EXPERIENCE_ICONS: IconComponent[] = [Gem, Sparkles, Compass, BedDouble, Waves];
const OFFERINGS_ICONS: IconComponent[] = [ConciergeBell, Wrench, BedDouble, Utensils, ShieldCheck, LifeBuoy];
const WELLNESS_ICONS: IconComponent[] = [Flower2, Sparkles];

function PillarCard({
  icon: Icon,
  label,
  reduceMotion,
  index,
}: {
  icon: IconComponent;
  label: string;
  reduceMotion: boolean;
  index: number;
}) {
  return (
    <motion.li
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }
      }
      className="group flex items-center gap-4 rounded-2xl border border-brand-gold/15 bg-brand-charcoal/60 px-5 py-4 transition-colors duration-500 hover:border-brand-gold/60 hover:bg-brand-charcoal/85"
    >
      <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full border border-brand-gold/35 bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-charcoal transition-colors duration-500">
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-brand-white/90 text-sm sm:text-base leading-snug">{label}</span>
    </motion.li>
  );
}

type PillarProps = {
  kicker: string;
  title: string;
  accent?: string;
  items: { icon: IconComponent; label: string }[];
  className?: string;
  accentImage?: string;
};

function Pillar({ kicker, title, accent, items, className, accentImage }: PillarProps) {
  const reduceMotion = useReducedMotion() === true;
  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-brand-gold/15 bg-gradient-to-br from-brand-teal/80 via-brand-charcoal to-brand-forest/90 p-7 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.4)] ${className ?? ""}`}
    >
      {accentImage && (
        <div
          className="pointer-events-none absolute -top-12 -end-12 w-48 sm:w-56 aspect-square opacity-[0.14] z-0"
          aria-hidden
        >
          <Image
            src={accentImage}
            alt=""
            fill
            sizes="14rem"
            className="object-cover rounded-full blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-brand-charcoal/60 to-brand-charcoal" />
        </div>
      )}
      <div className="relative z-[1]">
        <SectionLabel tone="gold" className="mb-4">{kicker}</SectionLabel>
        <h3 className="font-serif font-light text-brand-white text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-8">
          {title}
          {accent ? <span className="text-brand-gold italic"> {accent}</span> : null}
        </h3>
        <ul className="grid gap-3">
          {items.map((item, i) => (
            <PillarCard key={item.label} {...item} reduceMotion={reduceMotion} index={i} />
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function ServicesBentoSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("services");

  const experienceItems = (t.raw("experience.items") as string[]).map((label, i) => ({
    icon: EXPERIENCE_ICONS[i] ?? Sparkles,
    label,
  }));
  const wellnessItems = (t.raw("wellness.items") as string[]).map((label, i) => ({
    icon: WELLNESS_ICONS[i] ?? Sparkles,
    label,
  }));
  const offeringsItems = (t.raw("offerings.items") as string[]).map((label, i) => ({
    icon: OFFERINGS_ICONS[i] ?? Sparkles,
    label,
  }));

  return (
    <section id="services" className="relative bg-brand-forest py-24 sm:py-32 md:py-44 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <motion.div {...reveal} className="max-w-4xl mb-14 md:mb-20 text-center mx-auto">
          <SectionLabel className="mb-6">{t("label")}</SectionLabel>
          <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight">
            {t("heading")} <span className="italic text-brand-gold">{t("headingAccent")}</span>
          </h2>
          <p className="mt-6 text-brand-white/70 text-base sm:text-lg leading-relaxed">{t("intro")}</p>
        </motion.div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
          <Pillar
            kicker={t("experience.kicker")}
            title={t("experience.title")}
            accent={t("experience.accent")}
            items={experienceItems}
            className="lg:col-span-2 lg:row-span-1"
          />
          <Pillar
            kicker={t("wellness.kicker")}
            title={t("wellness.title")}
            accent={t("wellness.accent")}
            items={wellnessItems}
            accentImage="/images/Stock/Serene Spa Setting.webp"
            className="lg:row-span-1"
          />
          <Pillar
            kicker={t("offerings.kicker")}
            title={t("offerings.title")}
            accent={t("offerings.accent")}
            items={offeringsItems}
            className="lg:col-span-3"
          />
        </div>
      </div>
    </section>
  );
}
