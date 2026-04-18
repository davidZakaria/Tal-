"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduceMotion ? undefined : { opacity: 0, filter: "blur(8px)", y: 15 }}
        animate={reduceMotion ? undefined : { opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, filter: "blur(8px)", y: -15 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
