"use client";

import { Card, Mono } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { LEVELS } from "@/lib/content/levels";
import { useStore } from "@/lib/store";
import { cn } from "@/components/ui/cn";

export function LevelStrip() {
  const { state } = useStore();

  return (
    <Reveal delay={0.26}>
      <Card className="p-6 sm:p-7">
        <Mono className="text-ink-3">Level guide</Mono>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {LEVELS.map((lvl) => {
            const isCurrent = lvl.id === state.level;
            const isTarget = lvl.id === state.targetLevel;
            return (
              <div
                key={lvl.id}
                className={cn(
                  "rounded-xl border p-3.5 transition-colors",
                  isCurrent ? "border-signal/50 bg-signal/[0.07]" : isTarget ? "border-mint/40 bg-mint/[0.06]" : "border-[var(--line)]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-[13px] font-semibold", isCurrent ? "text-signal" : isTarget ? "text-mint" : "text-ink-1")}>
                    {lvl.id}
                  </span>
                  {isCurrent ? <Mono className="text-signal">you</Mono> : isTarget ? <Mono className="text-mint">goal</Mono> : null}
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-ink-3">{lvl.canDo}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </Reveal>
  );
}
