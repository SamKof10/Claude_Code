"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInViewOnce } from "@/hooks";
import { cn } from "./cn";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

interface RevealProps {
  children: ReactNode;
  index?: number;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/**
 * Scroll-triggered fade + rise, built on IntersectionObserver + CSS
 * transitions (no animation library). `.reveal` is force-shown under
 * `prefers-reduced-motion` in globals.css, so this never needs to branch on
 * that setting itself — no SSR/CSR mismatch risk.
 */
export function Reveal({ children, index = 0, delay = 0, y = 18, className }: RevealProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const totalDelay = delay + index * 0.06;
  const style: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : `translateY(${y}px)`,
    transition: `opacity 620ms ${EASE} ${totalDelay}s, transform 620ms ${EASE} ${totalDelay}s`,
  };
  return (
    <div ref={ref} className={cn("reveal", className)} style={style}>
      {children}
    </div>
  );
}

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ opacity: inView ? 1 : 0, transition: `opacity 400ms ${EASE}` }}>
      {children}
    </div>
  );
}

export function RevealItem({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const style: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 550ms ${EASE} ${index * 0.05}s, transform 550ms ${EASE} ${index * 0.05}s`,
  };
  return (
    <div ref={ref} className={cn("reveal", className)} style={style}>
      {children}
    </div>
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
