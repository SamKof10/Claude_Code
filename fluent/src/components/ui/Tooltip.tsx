"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

interface TooltipProps {
  children: ReactNode;
  label: string;
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Small pop-in tooltip on hover/focus — the Unlumen UI idiom for
 * icon-only controls, done with a pure CSS opacity+scale transition
 * (`.tooltip-bubble` in globals.css). Centering uses `inset-x-0` +
 * `w-max` + auto margins rather than a translate, so it never has to
 * compose with the bubble's own transform.
 */
export function Tooltip({ children, label, side = "bottom", className }: TooltipProps) {
  return (
    <span className={cn("tooltip-trigger relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "tooltip-bubble mono absolute inset-x-0 mx-auto w-max rounded-lg border border-[var(--line-strong)] bg-surface-2 px-2.5 py-1.5 text-ink-1 shadow-lg",
          side === "bottom" ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]",
        )}
      >
        {label}
      </span>
    </span>
  );
}
