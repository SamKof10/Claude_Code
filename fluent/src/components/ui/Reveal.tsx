"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "./cn";

const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * This doesn't branch its markup on `useReducedMotion()`. That hook is
 * always false during SSR, so a branch here would make the server emit
 * start styles that a reduced-motion client never applies, and hydration
 * would fail. Reduced motion is handled once, globally, by
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
export function Reveal({ children, index = 0, delay = 0, y = 18, className, once = true }: RevealProps) {
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

/**
 * A short highlight sweeping through a headline word — Magic UI's
 * "Shiny Text" idiom, done as a `background-clip: text` gradient sweep
 * (`.shiny-text` in globals.css). Forced to a flat colour under
 * `prefers-reduced-motion`, so no branching needed here.
 */
export function ShinyText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
}) {
  return <Tag className={cn("shiny-text", className)}>{text}</Tag>;
}
