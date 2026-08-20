"use client";

import type { ReactNode } from "react";
import { Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

export function StepCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-xl rounded-3xl border border-[var(--line)] bg-surface-1 p-6 sm:p-8", className)}>
      {children}
    </div>
  );
}

export function StepKicker({ children }: { children: ReactNode }) {
  return <Mono className="mb-3 block text-signal">{children}</Mono>;
}

export function FeedbackBanner({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed",
        correct ? "border-mint/30 bg-mint/[0.07] text-mint" : "border-coral/30 bg-coral/[0.07] text-coral",
      )}
    >
      {children}
    </div>
  );
}
