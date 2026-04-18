"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarCheck2, Check, Sparkles, ShieldCheck, Heart, Crown, KeyRound } from "lucide-react";
import { scrollRevealProps, staggerContainer, staggerItem } from "@/lib/brochureMotion";
import { SectionLabel } from "./SectionLabel";

const DETAIL_ICONS = [CalendarCheck2, KeyRound, Crown, Sparkles, Heart];

export default function MembershipSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("membership");

  const details = (t.raw("details") as string[]).map((label, i) => ({
    icon: DETAIL_ICONS[i] ?? Sparkles,
    label,
  }));
  const benefits = t.raw("benefits") as string[];

  return (
    <section id="membership" className="relative bg-brand-charcoal py-24 sm:py-32 md:py-44 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, #c9a86a 0, transparent 40%), radial-gradient(circle at 80% 90%, #c9a86a 0, transparent 45%)",
        }}
        aria-hidden
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative">
        <motion.div {...reveal} className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <SectionLabel className="mb-6">{t("label")}</SectionLabel>
          <h2 className="font-serif font-light text-brand-white text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-tight">
            {t("heading")}
            <span className="block italic text-brand-gold">{t("headingAccent")}</span>
          </h2>
          <p className="mt-6 text-brand-gold text-sm sm:text-base uppercase tracking-[0.35em] font-bold">
            {t("tagline")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer(reduceMotion)}
            className="relative rounded-[2rem] md:rounded-[2.5rem] border border-brand-gold/20 bg-gradient-to-br from-brand-teal/90 to-brand-forest p-8 sm:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
          >
            <SectionLabel tone="gold" className="mb-6">{t("receiveLabel")}</SectionLabel>
            <ul className="space-y-4">
              {details.map(({ icon: Icon, label }) => (
                <motion.li
                  key={label}
                  variants={staggerItem(reduceMotion)}
                  className="flex items-center gap-4 text-brand-white"
                >
                  <span className="w-11 h-11 rounded-full border border-brand-gold/40 bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-base sm:text-lg font-light">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer(reduceMotion)}
            className="relative rounded-[2rem] md:rounded-[2.5rem] border border-brand-gold/30 bg-brand-forest/90 p-8 sm:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <span className="absolute -top-16 -end-16 w-56 h-56 rounded-full bg-brand-gold/15 blur-3xl" aria-hidden />
            <SectionLabel tone="gold" className="mb-6 relative">
              {t("benefitsLabel")}
            </SectionLabel>
            <ul className="space-y-4 relative">
              {benefits.map((item) => (
                <motion.li
                  key={item}
                  variants={staggerItem(reduceMotion)}
                  className="flex items-start gap-4 text-brand-white/90"
                >
                  <span className="mt-1 w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/50 text-brand-gold flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-base sm:text-lg font-light leading-relaxed">{item}</span>
                </motion.li>
              ))}
              <motion.li
                variants={staggerItem(reduceMotion)}
                className="flex items-start gap-4 text-brand-white/90 pt-4 border-t border-brand-gold/20"
              >
                <span className="mt-1 w-7 h-7 rounded-full bg-brand-gold text-brand-charcoal flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm sm:text-base uppercase tracking-[0.25em] font-bold text-brand-gold">
                  {t("limited")}
                </span>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
