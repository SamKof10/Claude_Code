"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn";

/** Monospaced technical label — the retro-system accent, used sparingly. */
export function Mono({
  children,
  className,
  style,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "span" | "div" | "p";
}) {
  return (
    <Tag className={cn("mono", className)} style={style}>
      {children}
    </Tag>
  );
}

/** Small pill used for section kickers, filters and level tags. */
export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "signal" | "mint" | "amber" | "coral";
}) {
  const tones: Record<string, string> = {
    neutral: "border-[var(--line-strong)] text-ink-2 bg-surface-2/60",
    signal: "border-signal/35 text-signal-soft bg-signal/10",
    mint: "border-mint/35 text-mint bg-mint/10",
    amber: "border-amber/35 text-amber bg-amber/10",
    coral: "border-coral/35 text-coral bg-coral/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[-0.005em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "mint", className }: { tone?: "mint" | "amber" | "coral" | "signal"; className?: string }) {
  const colors: Record<string, string> = { mint: "bg-mint", amber: "bg-amber", coral: "bg-coral", signal: "bg-signal" };
  return (
    <span className={cn("relative grid h-2 w-2 place-items-center", className)}>
      <span className={cn("status-dot absolute inset-0 rounded-full", colors[tone])} />
      <span className={cn("absolute inset-0 rounded-full opacity-40", colors[tone])} />
    </span>
  );
}

/** Panel surface — the base card used across the whole app. */
export function Card({
  children,
  className,
  glass = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-[var(--line)]",
        glass ? "glass" : "bg-surface-1",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionKicker({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Mono className="text-signal">{index}</Mono>
      <span className="h-px w-8" style={{ background: "var(--line-strong)" }} />
      <Mono className="text-ink-3">{label}</Mono>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "signal",
  trackClassName,
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "signal" | "mint" | "amber" | "coral";
  trackClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors: Record<string, string> = { signal: "bg-signal", mint: "bg-mint", amber: "bg-amber", coral: "bg-coral" };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", trackClassName, className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]", colors[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="mono rounded-md border border-[var(--line-strong)] bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-2">
      {children}
    </kbd>
  );
}
