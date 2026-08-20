"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * None of these components branch their markup on `useReducedMotion()`.
 * That hook is always false during SSR, so a branch here would make the
 * server emit start styles that a reduced-motion client never applies, and
 * hydration would fail. Reduced motion is handled once, globally, by
 * <MotionConfig reducedMotion="user"> in MotionProvider.
 */

interface RevealProps {
  children: ReactNode;
  /** Stagger index — multiplied by 60 ms. */
  index?: number;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Scroll-triggered fade + rise. */
export function Reveal({ children, index = 0, delay = 0, y = 22, className, once = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.62, ease: EASE, delay: delay + index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE } },
};

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word text reveal for section headlines. Splits on spaces and keeps
 * the markup as a single block so line breaking is unaffected.
 */
export function TextReveal({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
}) {
  const words = text.split(" ");
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-14% 0px -14% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.035, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        // The separating space is a text node *between* the clipping spans.
        // Inside one, `overflow: hidden` on an inline-block eats the trailing
        // whitespace and the words run together.
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration: 0.68, ease: EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </MotionTag>
  );
}
