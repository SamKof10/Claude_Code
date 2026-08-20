"use client";

import { useEffect, useState } from "react";
import { Play, Pause, FileText, ArrowLeft } from "lucide-react";
import { Badge, Card } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { ACCENT_LABELS, type ListeningExercise } from "@/lib/content/listening";

const DEMO_PLAY_MS = 5000;

export function ListeningPlayer({ exercise, onBack }: { exercise: ListeningExercise; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const accent = ACCENT_LABELS[exercise.accent];

  useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / DEMO_PLAY_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setPlaying(false);
        clearInterval(id);
      }
    }, 80);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink-1">
        <ArrowLeft size={14} /> All exercises
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="signal">{exercise.level}</Badge>
        <Badge>{accent.flag} {accent.label}</Badge>
        <Badge>{exercise.topic}</Badge>
        <span className="mono text-ink-3">{exercise.durationSec}s</span>
      </div>

      <h2 className="mt-3 text-[20px] font-medium text-ink-1">{exercise.title}</h2>
      <p className="mt-1 text-[13px] text-ink-3">{exercise.speaker}</p>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-surface-2/50 p-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-signal text-white transition-transform active:scale-95"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <div className="flex flex-1 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 32 }).map((_, i) => (
              <span
                key={i}
                className={cn("wave-bar w-full rounded-full", i / 32 < progress / 100 ? "bg-signal" : "bg-surface-3")}
                style={{ height: `${14 + ((i * 37) % 22)}px`, animationPlayState: playing ? "running" : "paused", animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTranscriptOpen((o) => !o)}
          className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink-1"
        >
          <FileText size={13} /> {transcriptOpen ? "Hide transcript" : "Show transcript"}
        </button>
        {transcriptOpen ? <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{exercise.transcript}</p> : null}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {exercise.questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-[14px] font-medium text-ink-1">{q.q}</p>
            <div className="mt-2.5 flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi];
                const isChosen = chosen === oi;
                const revealed = chosen !== undefined;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={revealed}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={cn(
                      "rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] transition-colors",
                      revealed && oi === q.answerIndex
                        ? "border-mint/40 bg-mint/[0.08] text-mint"
                        : revealed && isChosen
                          ? "border-coral/40 bg-coral/[0.08] text-coral"
                          : "border-[var(--line)] text-ink-2 hover:border-[var(--line-strong)]",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answers[qi] !== undefined ? (
              <p className={cn("mt-2 text-[13px] leading-relaxed", answers[qi] === q.answerIndex ? "text-mint" : "text-coral")}>
                {q.explanation}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
