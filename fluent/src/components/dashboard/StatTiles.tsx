"use client";

import type { CSSProperties } from "react";
import { Flame, Clock, BookMarked, TrendingUp } from "lucide-react";
import { Card, Mono } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/components/ui/cn";
import { useStore, SKILL_LABELS, type Skill } from "@/lib/store";

function Tile({
  icon: Icon,
  label,
  children,
  retro = false,
}: {
  icon: typeof Flame;
  label: string;
  children: React.ReactNode;
  retro?: boolean;
}) {
  return (
    <Card
      className={cn("flex flex-col gap-3 p-5", retro && "retro-panel")}
      style={retro ? ({ "--retro-tone": "var(--color-amber)" } as CSSProperties) : undefined}
    >
      <div className="flex items-center justify-between">
        <Mono className="text-ink-3">{label}</Mono>
        <Icon size={15} strokeWidth={1.8} className={retro ? "text-amber" : "text-ink-3"} />
      </div>
      {children}
    </Card>
  );
}

export function StatTiles() {
  const { state } = useStore();
  const weakest = (Object.entries(state.skillScores) as [Skill, number][]).sort((a, b) => a[1] - b[1])[0];
  const goalPct = Math.min(100, Math.round((state.minutesToday / state.dailyGoalMinutes) * 100));

  return (
    <Reveal delay={0.14}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={Flame} label="Streak" retro>
          <p className="display text-[26px] text-ink-1 tnum">{state.streakDays}d</p>
        </Tile>
        <Tile icon={Clock} label="Today's goal">
          <p className="display text-[26px] text-ink-1 tnum">
            {state.minutesToday}<span className="text-ink-3">/{state.dailyGoalMinutes}m</span>
          </p>
          <p className="text-[11.5px] text-ink-3">{goalPct}% done</p>
        </Tile>
        <Tile icon={BookMarked} label="Words mastered">
          <p className="display text-[26px] text-ink-1 tnum">
            <AnimatedNumber value={state.totalWordsMastered} />
          </p>
        </Tile>
        <Tile icon={TrendingUp} label="Focus area">
          <p className="display text-[20px] text-coral">{SKILL_LABELS[weakest[0]]}</p>
          <p className="text-[11.5px] text-ink-3">{weakest[1]}% — your lowest skill right now</p>
        </Tile>
      </div>
    </Reveal>
  );
}
