"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn";

interface BorderBeamProps {
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

/**
 * Magic UI's "Border Beam": a bright point travelling once around a
 * rounded edge. Pure CSS conic-gradient animating an `@property` angle
 * (`.border-beam` in globals.css) — no animation library involved.
 */
export function BorderBeam({ children, className, color = "var(--color-signal)", duration = 4.5 }: BorderBeamProps) {
  const style = { "--beam-color": color, "--beam-duration": `${duration}s` } as CSSProperties;
  return (
    <div className={cn("border-beam", className)} style={style}>
      {children}
    </div>
  );
}
