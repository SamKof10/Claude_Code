"use client";

import { Card, Mono } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LineTrend, BarRows } from "@/components/ui/Charts";
import { Reveal } from "@/components/ui/Reveal";
import { MonthlyTestCard } from "@/components/progress/MonthlyTestCard";
import { useStore, SKILL_LABELS, type Skill } from "@/lib/store";
import { LEVELS } from "@/lib/content/levels";
import { cn } from "@/components/ui/cn";

export default function ProgressPage() {
  const { state } = useStore();
  const skillData = (Object.entries(state.skillScores) as [Skill, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([skill, value]) => ({ label: SKILL_LABELS[skill], value, emphasis: value < 65 }));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Statistics</h1>
          <p className="lede mt-2 max-w-xl">Which skill is holding you back, and how far you&rsquo;ve come.</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Streak", value: state.streakDays, suffix: "d" },
          { label: "Study time", value: Math.round(state.totalMinutes / 60), suffix: "h" },
          { label: "Words mastered", value: state.totalWordsMastered },
          { label: "Sessions logged", value: state.sessions.length },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <Mono className="text-ink-3">{s.label}</Mono>
            <p className="display mt-1.5 text-[24px] text-ink-1 tnum">
              <AnimatedNumber value={s.value} suffix={s.suffix ?? ""} />
            </p>
          </Card>
        ))}
      </div>

      <MonthlyTestCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <Mono className="text-ink-3">C1 progress, last 8 weeks</Mono>
            <span className="text-[13px] font-medium text-signal">{state.c1Progress}%</span>
          </div>
          <div className="mt-4">
            <LineTrend data={state.weeklyProgress} />
          </div>
        </Card>
        <Card className="p-6 sm:p-7">
          <Mono className="text-ink-3">Skill breakdown</Mono>
          <div className="mt-5">
            <BarRows data={skillData} />
          </div>
        </Card>
      </div>

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
                  "rounded-xl border p-3.5",
                  isCurrent ? "border-signal/50 bg-signal/[0.07]" : isTarget ? "border-mint/40 bg-mint/[0.06]" : "border-[var(--line)]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-[13px] font-semibold", isCurrent ? "text-signal" : isTarget ? "text-mint" : "text-ink-1")}>{lvl.id}</span>
                  {isCurrent ? <Mono className="text-signal">you</Mono> : isTarget ? <Mono className="text-mint">goal</Mono> : null}
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-ink-3">{lvl.canDo}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
