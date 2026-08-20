"use client";

import type { CSSProperties } from "react";
import { Trophy, Lock } from "lucide-react";
import { Card, Mono, ProgressBar } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { useConfetti } from "@/hooks";
import { useStore } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { cn } from "@/components/ui/cn";

const AMBER_TONE = { "--retro-tone": "var(--color-amber)" } as CSSProperties;

export default function AchievementsPage() {
  const { state } = useStore();
  const burst = useConfetti();
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked(state));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Achievements</h1>
            <p className="lede mt-2 max-w-xl">Quiet milestones, not XP spam.</p>
          </div>
          <Mono className="text-ink-3">{unlocked.length}/{ACHIEVEMENTS.length}</Mono>
        </div>
      </Reveal>

      {unlocked.length > 0 ? (
        <Reveal delay={0.04}>
          <Marquee duration={32} className="rounded-2xl border border-[var(--line)] bg-surface-1 py-3">
            {unlocked.map((a) => (
              <span key={a.id} className="mono flex shrink-0 items-center gap-2 px-4 text-amber">
                <Trophy size={13} /> {a.title}
              </span>
            ))}
          </Marquee>
        </Reveal>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = a.unlocked(state);
          const progress = a.progress(state);
          return (
            <Card key={a.id} className={cn("p-5", !isUnlocked && "opacity-60")}>
              <div className="flex items-start gap-3">
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
                    }}
                    aria-label={`Celebrate: ${a.title}`}
                    className="retro-badge grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber"
                    style={AMBER_TONE}
                  >
                    <Trophy size={17} />
                  </button>
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-3">
                    <Lock size={15} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink-1">{a.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-3">{a.description}</p>
                  {!isUnlocked ? (
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
