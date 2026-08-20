"use client";

import { useEffect } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScoreGauge } from "@/components/ui/Charts";
import { useConfetti } from "@/hooks";
import { cn } from "@/components/ui/cn";
import { SKILL_LABELS, type MonthlyTestRecord, type Skill } from "@/lib/store";

export function MonthlyTestResults({ record, previous }: { record: MonthlyTestRecord; previous: MonthlyTestRecord | null }) {
  const burst = useConfetti();

  useEffect(() => {
    if (record.leveledUp) burst(window.innerWidth / 2, window.innerHeight / 3, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const delta = previous ? record.overallScore - previous.overallScore : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center">
      <div className="glow-signal grid h-16 w-16 place-items-center rounded-full bg-signal/15">
        <Sparkles size={26} className="text-signal" />
      </div>
      <h1 className="display mt-6 text-[32px] text-ink-1">Check-in #{record.monthIndex} complete</h1>
      <p className="lede mt-2">{record.leveledUp ? `You've moved up to ${record.level}.` : `Still ${record.level} — keep going.`}</p>

      <div className="mt-8 flex items-center gap-3">
        <p className="display text-[48px] text-ink-1 tnum">
          <AnimatedNumber value={record.overallScore} suffix="%" />
        </p>
        {delta !== null ? (
          <span className={cn("mono flex items-center gap-1", delta > 0 ? "text-mint" : delta < 0 ? "text-coral" : "text-ink-3")}>
            {delta > 0 ? <TrendingUp size={13} /> : delta < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
            {delta > 0 ? "+" : ""}
            {delta}% vs last month
          </span>
        ) : null}
      </div>

      {record.leveledUp ? (
        <Badge tone="mint" className="mt-3">
          Level up · {record.level}
        </Badge>
      ) : null}

      <Card className="mt-8 w-full p-6 text-left sm:p-7">
        <Mono className="text-ink-3">Skill breakdown</Mono>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {(Object.entries(record.skillScores) as [Skill, number][]).map(([skill, value]) => (
            <ScoreGauge key={skill} label={SKILL_LABELS[skill]} value={value} tone={value >= 70 ? "mint" : value >= 45 ? "signal" : "coral"} />
          ))}
        </div>
        <p className="mt-5 text-[12.5px] leading-relaxed text-ink-3">
          Speaking isn&rsquo;t tested here — it&rsquo;s scored continuously from your daily speaking practice instead.
        </p>
      </Card>

      <ButtonLink href="/progress" size="lg" className="mt-8" magnetic shimmer>
        Back to progress
      </ButtonLink>
    </div>
  );
}
