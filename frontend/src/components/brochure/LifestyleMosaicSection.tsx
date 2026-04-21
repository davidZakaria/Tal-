"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A quiet editorial breather between content-heavy sections.
 * No copy — just three curated lifestyle images in an off-grid
 * composition (brand rule: "off-grid image arrangements").
 */
const TILES = [
  {
    src: "/images/Stock/11.png",
    className:
      "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto md:h-full rounded-[1.75rem] md:rounded-[2.25rem]",
  },
  {
    src: "/images/Stock/5.png",
    className:
      "md:col-span-5 md:row-span-1 aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] md:translate-y-4",
  },
  {
    src: "/images/Stock/Layer 1.png",
    className:
      "md:col-span-5 md:row-span-1 aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] md:-translate-y-4",
  },
] as const;

export default function LifestyleMosaicSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-hidden
      className="relative bg-brand-charcoal pt-4 pb-20 sm:pt-8 sm:pb-28 md:pt-12 md:pb-36 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          {TILES.map((tile, i) => (
            <motion.div
              key={tile.src}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.95, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
              }
              className={`relative overflow-hidden border border-brand-gold/15 shadow-[0_30px_70px_rgba(0,0,0,0.5)] ${tile.className}`}
            >
              <Image
                src={tile.src}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-noise-overlay opacity-30 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
