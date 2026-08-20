import type { ReactNode } from "react";
import { cn } from "./cn";

/** Small mono label — the machine's own voice. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("mono", className)}>{children}</span>;
}

export function StatusDot({
  tone = "hivis",
  className,
}: {
  tone?: "hivis" | "water" | "muted";
  className?: string;
}) {
  const colour =
    tone === "hivis" ? "bg-hivis" : tone === "water" ? "bg-water" : "bg-concrete/35";
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5", className)}>
      <span className={cn("status-dot absolute inset-0 rounded-full", colour)} />
      <span className={cn("absolute inset-0 rounded-full opacity-40", colour)} />
    </span>
  );
}

/** The number + eyebrow pair that opens every section. */
export function SectionMarker({
  number,
  label,
  dark = true,
  className,
}: {
  number: string;
  label: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "mono tnum",
          dark ? "text-hivis" : "text-steel",
        )}
      >
        {number}
      </span>
      <span
        className={cn("h-px w-8", dark ? "bg-[var(--edge-strong)]" : "bg-[var(--edge-light-strong)]")}
      />
      <span className={cn("mono", dark ? "text-concrete/55" : "text-steel/55")}>{label}</span>
    </div>
  );
}

/** Wraps a page section: consistent rhythm, optional light ground. */
export function Section({
  id,
  children,
  className,
  tone = "dark",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "darker" | "light";
}) {
  const grounds = {
    dark: "bg-steel text-concrete",
    darker: "bg-[#0a0c0d] text-concrete",
    light: "bg-concrete text-steel",
  } as const;
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20 px-5 py-24 sm:px-8 md:py-32",
        grounds[tone],
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </section>
  );
}

/** A hairline that reads as a machined seam rather than a border. */
export function Seam({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div
      className={cn("h-px w-full", light ? "bg-[var(--edge-light)]" : "bg-[var(--edge)]", className)}
    />
  );
}

/** Honest labelling for every invented figure on the page. */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mono !tracking-[0.1em] text-concrete/35 !normal-case", className)}>
      {children}
    </p>
  );
}

export function Pill({
  children,
  className,
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light" | "hivis";
}) {
  const tones = {
    dark: "border-[var(--edge-strong)] text-concrete/70",
    light: "border-[var(--edge-light-strong)] text-steel/70",
    hivis: "border-hivis/50 text-hivis",
  } as const;
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Spec row used in every table on the site. */
export function SpecRow({
  label,
  value,
  light = false,
}: {
  label: string;
  value: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-b py-3.5",
        light ? "border-[var(--edge-light)]" : "border-[var(--edge)]",
      )}
    >
      <span className={cn("mono", light ? "text-steel/50" : "text-concrete/45")}>{label}</span>
      <span
        className={cn(
          "tnum text-right text-sm font-medium",
          light ? "text-steel" : "text-concrete",
        )}
      >
        {value}
      </span>
    </div>
  );
}
