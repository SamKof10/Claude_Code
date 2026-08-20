"use client";

import { Trophy, Lock } from "lucide-react";
import { Card, Mono, ProgressBar } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { useStore } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { cn } from "@/components/ui/cn";

export default function AchievementsPage() {
  const { state } = useStore();
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked(state)).length;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Achievements</h1>
            <p className="lede mt-2 max-w-xl">Quiet milestones, not XP spam.</p>
          </div>
          <Mono className="text-ink-3">{unlockedCount}/{ACHIEVEMENTS.length}</Mono>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.unlocked(state);
          const progress = a.progress(state);
          return (
            <Card key={a.id} className={cn("p-5", !unlocked && "opacity-60")}>
              <div className="flex items-start gap-3">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", unlocked ? "bg-amber/15 text-amber" : "bg-surface-2 text-ink-3")}>
                  {unlocked ? <Trophy size={17} /> : <Lock size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink-1">{a.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-3">{a.description}</p>
                  {!unlocked ? (
                    <div className="mt-2.5 flex items-center gap-2">
                      <ProgressBar value={progress.current} max={progress.target} tone="amber" className="flex-1" />
                      <span className="mono shrink-0 text-ink-3">{progress.current}/{progress.target}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
