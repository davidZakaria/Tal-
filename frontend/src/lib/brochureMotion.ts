import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion primitives used across brochure sections.
 * Keep spring values in one place so the page breathes with a single cadence.
 */
export const brochureSpring = {
  type: "spring" as const,
  damping: 26,
  stiffness: 120,
};

export const brochureEase = [0.22, 1, 0.36, 1] as const;

/** Scroll-reveal props that respect `prefers-reduced-motion`. */
export function scrollRevealProps(reduceMotion: boolean | null) {
  const off = reduceMotion === true;
  return {
    initial: off ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" as const },
    transition: off ? { duration: 0 } : brochureSpring,
  };
}

/** Stagger container for lists / grids. */
export const staggerContainer = (reduceMotion: boolean | null): Variants => {
  const off = reduceMotion === true;
  return {
    hidden: { opacity: off ? 1 : 0 },
    show: {
      opacity: 1,
      transition: off ? { duration: 0 } : { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };
};

export const staggerItem = (reduceMotion: boolean | null): Variants => {
  const off = reduceMotion === true;
  return {
    hidden: off ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: off ? { duration: 0 } : { duration: 0.7, ease: brochureEase } },
  };
};
