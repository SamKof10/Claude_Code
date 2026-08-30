"use client";

import Link from "next/link";
import { useNow } from "@/lib/clock";
import { PHASE_LABEL, useFocusStore } from "@/lib/store/focus";
import { cn, formatClock } from "@/lib/utils";

/** Compact countdown in the topbar, so a running block is visible from every page. */
export function FocusIndicator() {
  const status = useFocusStore((s) => s.status);
  const phase = useFocusStore((s) => s.phase);
  const endsAt = useFocusStore((s) => s.endsAt);
  const remainingMs = useFocusStore((s) => s.remainingMs);
  const now = useNow();

  if (status === "idle") return null;

  const msLeft = status === "running" && endsAt !== null && now > 0 ? Math.max(0, endsAt - now) : remainingMs;

  return (
    <Link
      href="/focus"
      aria-label={`${PHASE_LABEL[phase]}, ${formatClock(msLeft)} left${status === "paused" ? ", paused" : ""}`}
      className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 transition-colors hover:border-border-strong"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "paused" ? "bg-ink-3" : phase === "focus" ? "bg-[var(--color-signal)]" : "bg-success"
        )}
      />
      <span className="font-mono t-caption font-medium text-ink tabular-nums">{formatClock(msLeft)}</span>
    </Link>
  );
}
