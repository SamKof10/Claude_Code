"use client";

import type { CSSProperties, ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "./cn";

/** Small pill used for announcements and section kickers. */
export function Badge({
  children,
  className,
  night = false,
  animated = false,
}: {
  children: ReactNode;
  className?: string;
  night?: boolean;
  animated?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] tracking-[-0.005em]",
        night
          ? "border-[var(--line-night-strong)] bg-white/[0.04] text-paper/85"
          : "border-[var(--line-strong)] bg-white/50 text-ink-2",
        animated && "anim-border",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Monospaced technical label — the retro accent, used sparingly. */
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
    <Tag className={cn("mono-label", className)} style={style}>
      {children}
    </Tag>
  );
}

/** A section number + name, sitting above a headline. */
export function SectionKicker({
  index,
  label,
  night = false,
  className,
}: {
  index: string;
  label: string;
  night?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Mono className={night ? "text-ember" : "text-ember-deep"}>{index}</Mono>
      <span
        className="h-px w-8"
        style={{ background: night ? "var(--line-night-strong)" : "var(--line-strong)" }}
      />
      <Mono className={night ? "text-paper/55" : "text-ink-3"}>{label}</Mono>
    </div>
  );
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-2 w-2 place-items-center", className)}>
      <span className="status-dot absolute inset-0 rounded-full bg-ember" />
      <span className="absolute inset-0 rounded-full bg-ember/40" />
    </span>
  );
}

export function Stars({
  rating,
  size = 13,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={i < Math.round(rating) ? "fill-ember text-ember" : "text-ink-3/40"}
        />
      ))}
    </span>
  );
}

/** Pixel-grid ornament — a whisper of retro, drawn with a repeating gradient. */
export function PixelGrid({ className, night = false }: { className?: string; night?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${
          night ? "rgba(246,244,240,0.16)" : "rgba(19,18,17,0.14)"
        } 1px, transparent 0)`,
        backgroundSize: "8px 8px",
      }}
    />
  );
}
