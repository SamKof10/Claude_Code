"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, Mono, Badge, ProgressBar } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ConfusablePractice } from "@/components/progress/ConfusablePractice";
import { useStore, SKILL_LABELS, type Skill } from "@/lib/store";
import { VOCAB_WORDS } from "@/lib/content/vocabulary";

const SKILL_LINKS: Record<Skill, string> = {
  vocabulary: "/vocabulary",
  listening: "/listening",
  speaking: "/speaking",
  grammar: "/grammar",
  writing: "/writing",
  naturalness: "/natural",
};

export default function WeakAreasPage() {
  const { state } = useStore();
  const sortedSkills = (Object.entries(state.skillScores) as [Skill, number][]).sort((a, b) => a[1] - b[1]);

  const strugglingWords = Object.entries(state.vocab)
    .filter(([, p]) => p.state === "learning" || (p.state === "new" && p.lastResult === "incorrect"))
    .map(([id]) => VOCAB_WORDS.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Weak Areas</h1>
          <p className="lede mt-2 max-w-xl">The system tracks what you struggle with — here&rsquo;s where to focus next.</p>
        </div>
      </Reveal>

      <Card className="p-6 sm:p-7">
        <Mono className="text-ink-3">Skills, weakest first</Mono>
        <div className="mt-4 flex flex-col gap-4">
          {sortedSkills.map(([skill, value]) => (
            <Link key={skill} href={SKILL_LINKS[skill]} className="group flex items-center gap-4">
              <span className="w-24 shrink-0 text-[13px] text-ink-2 group-hover:text-ink-1">{SKILL_LABELS[skill]}</span>
              <ProgressBar value={value} tone={value < 65 ? "coral" : "signal"} className="flex-1" />
              <span className="mono w-9 shrink-0 text-right text-ink-3">{value}%</span>
              <ArrowRight size={14} className="shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </Card>

      {strugglingWords.length ? (
        <Card className="p-6 sm:p-7">
          <Mono className="text-ink-3">Words you&rsquo;re still shaky on</Mono>
          <div className="mt-4 flex flex-col gap-2">
            {strugglingWords.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-ink-1">{w.word}</p>
                  <p className="text-[12.5px] text-ink-3">{w.meaning}</p>
                </div>
                <Badge tone="coral">learning</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div>
        <Mono className="mb-3 block text-ink-3">Smart review — confusable pairs</Mono>
        <ConfusablePractice />
      </div>
    </div>
  );
}
