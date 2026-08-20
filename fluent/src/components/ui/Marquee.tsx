"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}

/**
 * Magic UI's "Marquee": an infinite horizontal strip that pauses on
 * hover/focus. Content is rendered twice back-to-back so the loop from
 * `translateX(-50%)` is seamless (`.marquee-track` in globals.css).
 */
export function Marquee({ children, className, duration = 26, reverse = false }: MarqueeProps) {
  const style = {
    "--marquee-duration": `${duration}s`,
    animationDirection: reverse ? "reverse" : "normal",
  } as CSSProperties;

  return (
    <div className={cn("marquee-pause overflow-hidden", className)}>
      <div className="marquee-track" style={style}>
        <div className="flex shrink-0 items-center gap-3 pr-3">{children}</div>
        <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
