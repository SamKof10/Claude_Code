"use client";

import type { CSSProperties } from "react";
import { Card, Mono, StatusDot } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { useStore } from "@/lib/store";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-t border-[var(--line)] py-2.5 first:border-t-0 first:pt-0">
      <Mono className="text-ink-3">{label}</Mono>
      <span className="mono tnum text-ink-1">{value}</span>
    </div>
  );
}

export function SystemStatusPanel() {
  const { state } = useStore();
  const filled = Math.round(state.c1Progress / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);

  return (
    <Reveal delay={0.1}>
      <Card
        className="crt retro-panel relative overflow-hidden bg-surface-1 p-6"
        style={{ "--retro-tone": "var(--color-mint)" } as CSSProperties}
      >
        <div className="relative z-[1] flex items-center justify-between">
          <Mono className="text-ink-2">System status</Mono>
          <span className="flex items-center gap-1.5">
            <StatusDot tone="mint" />
            <Mono className="text-mint">online</Mono>
          </span>
        </div>
        <div className="relative z-[1] mt-3">
          <Row label="Language engine" value="Active" />
          <Row label="Current level" value={state.level} />
          <Row label="Target" value={state.targetLevel} />
          <Row label="Next milestone" value={<span className="text-signal">{bar} {state.c1Progress}%</span>} />
          <Row label="Words mastered" value={<AnimatedNumber value={state.totalWordsMastered} />} />
          <Row label="Study time logged" value={`${Math.round(state.totalMinutes / 60)}h`} />
        </div>
      </Card>
    </Reveal>
  );
}
