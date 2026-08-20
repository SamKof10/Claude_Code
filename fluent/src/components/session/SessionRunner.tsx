"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { DAILY_PATH, DAILY_TOTAL_MINUTES } from "@/lib/content/session";
import { useStore, type ActivityId, type SessionRecord } from "@/lib/store";
import { VocabStep } from "./steps/VocabStep";
import { ListeningStep } from "./steps/ListeningStep";
import { SpeakingStep } from "./steps/SpeakingStep";
import { GrammarStep } from "./steps/GrammarStep";
import { WritingStep } from "./steps/WritingStep";
import { NativeStep } from "./steps/NativeStep";
import { SessionComplete } from "./SessionComplete";

interface Stats {
  newWords: number;
  grammarPatterns: number;
  speakingExercises: number;
}

export function SessionRunner() {
  const { completeSession, markActivity } = useStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ newWords: 0, grammarPatterns: 0, speakingExercises: 0 });
  const [finished, setFinished] = useState<SessionRecord | null>(null);

  const activityIds: ActivityId[] = useMemo(() => ["vocabulary", "listening", "speaking", "grammar", "writing", "natural"], []);

  const advance = (patch?: Partial<Stats>) => {
    markActivity(activityIds[stepIndex]);
    const nextStats = { ...stats, ...patch };
    setStats(nextStats);

    if (stepIndex + 1 >= DAILY_PATH.length) {
      markActivity("session");
      const record = {
        date: new Date().toISOString().slice(0, 10),
        minutes: DAILY_TOTAL_MINUTES,
        newWords: nextStats.newWords,
        grammarPatterns: nextStats.grammarPatterns,
        speakingExercises: nextStats.speakingExercises || 1,
        progressGain: 2,
      };
      completeSession(record);
      setFinished(record);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  if (finished) return <SessionComplete record={finished} />;

  const current = DAILY_PATH[stepIndex];

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:px-8">
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Exit session" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink-1">
          <X size={18} />
        </Link>
        <div className="flex flex-1 gap-1.5">
          {DAILY_PATH.map((step, i) => (
            <span
              key={step.id}
              className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < stepIndex ? "bg-signal" : i === stepIndex ? "bg-signal/50" : "bg-surface-3")}
            />
          ))}
        </div>
        <Mono className="shrink-0 text-ink-3">{current.title}</Mono>
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        {current.id === "vocabulary" ? <VocabStep onComplete={(p) => advance(p)} /> : null}
        {current.id === "listening" ? <ListeningStep onComplete={() => advance()} /> : null}
        {current.id === "speaking" ? <SpeakingStep onComplete={() => advance({ speakingExercises: 1 })} /> : null}
        {current.id === "grammar" ? <GrammarStep onComplete={(p) => advance(p)} /> : null}
        {current.id === "writing" ? <WritingStep onComplete={() => advance()} /> : null}
        {current.id === "native" ? <NativeStep onComplete={() => advance()} /> : null}
      </div>
    </div>
  );
}
