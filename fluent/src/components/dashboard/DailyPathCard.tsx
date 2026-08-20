"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Mono } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { DAILY_PATH, DAILY_TOTAL_MINUTES } from "@/lib/content/session";

export function DailyPathCard() {
  return (
    <Reveal delay={0.05}>
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <Mono className="text-ink-3">Today</Mono>
          <Mono className="text-ink-3">{DAILY_TOTAL_MINUTES} min total</Mono>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {DAILY_PATH.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <Mono className="w-6 shrink-0 text-ink-3">{String(step.order).padStart(2, "0")}</Mono>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2">
                  <Icon size={16} strokeWidth={1.8} className="text-signal" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink-1">{step.title}</p>
                  <p className="truncate text-[12.5px] text-ink-3">{step.description}</p>
                </div>
                <Mono className="shrink-0 text-ink-3">{step.minutes} min</Mono>
              </li>
            );
          })}
        </ul>

        <ButtonLink href="/session" className="mt-6 w-full" size="lg" magnetic shimmer>
          Start session <ArrowRight size={16} />
        </ButtonLink>
      </Card>
    </Reveal>
  );
}
