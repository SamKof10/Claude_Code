"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Mono } from "@/components/ui/Primitives";
import { LineTrend, BarRows } from "@/components/ui/Charts";
import { Reveal } from "@/components/ui/Reveal";
import { useStore, SKILL_LABELS, type Skill } from "@/lib/store";

export function WeeklyChartCard() {
  const { state } = useStore();
  const skillData = (Object.entries(state.skillScores) as [Skill, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([skill, value]) => ({ label: SKILL_LABELS[skill], value, emphasis: value < 65 }));

  return (
    <Reveal delay={0.22}>
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
          <div className="flex items-center justify-between">
            <Mono className="text-ink-3">Skill breakdown</Mono>
            <ButtonLink href="/progress" variant="ghost" size="sm">
              Details <ArrowRight size={14} />
            </ButtonLink>
          </div>
          <div className="mt-5">
            <BarRows data={skillData} />
          </div>
        </Card>
      </div>
    </Reveal>
  );
}
