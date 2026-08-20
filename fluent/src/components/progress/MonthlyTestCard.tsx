"use client";

import { Lock, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { LineTrend } from "@/components/ui/Charts";
import { useStore, monthlyTestStatus } from "@/lib/store";

export function MonthlyTestCard() {
  const { state } = useStore();
  const status = monthlyTestStatus(state);
  const history = [...state.monthlyTests].reverse().map((t) => t.overallScore);

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <Mono className="text-ink-3">Monthly check-in</Mono>
        {status.available ? <Badge tone="mint">Ready</Badge> : <Badge>#{status.monthIndex}</Badge>}
      </div>

      {history.length >= 2 ? (
        <div className="mt-4">
          <LineTrend data={history} />
        </div>
      ) : (
        <p className="lede mt-3 max-w-sm">
          {state.monthlyTests.length === 0
            ? "A short mixed-skill test, once a month, so you can see real progress instead of guessing."
            : `Last score: ${state.monthlyTests[0].overallScore}%.`}
        </p>
      )}

      <div className="mt-5">
        {status.available ? (
          <ButtonLink href="/progress/monthly-test" size="lg" className="w-full" magnetic shimmer ripple>
            <Sparkles size={16} /> Start check-in #{status.monthIndex}
          </ButtonLink>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 text-[13px] text-ink-3">
            <Lock size={14} /> Unlocks in {status.daysUntilNext} day{status.daysUntilNext === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </Card>
  );
}
