"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { LISTENING_EXERCISES, ACCENT_LABELS, type Accent } from "@/lib/content/listening";

const LEVELS = ["All", "B2", "C1", "C2"] as const;
const ACCENTS: (Accent | "all")[] = ["all", "british", "american", "australian", "irish", "canadian"];

export function ExerciseList({ onSelect }: { onSelect: (id: string) => void }) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [accent, setAccent] = useState<Accent | "all">("all");

  const items = useMemo(
    () =>
      LISTENING_EXERCISES.filter((e) => (level === "All" || e.level === level) && (accent === "all" || e.accent === accent)),
    [level, accent],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                level === l ? "border-signal/50 bg-signal/10 text-signal-soft" : "border-[var(--line)] text-ink-3 hover:text-ink-1",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccent(a)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                accent === a ? "border-signal/50 bg-signal/10 text-signal-soft" : "border-[var(--line)] text-ink-3 hover:text-ink-1",
              )}
            >
              {a === "all" ? "All accents" : `${ACCENT_LABELS[a].flag} ${ACCENT_LABELS[a].label}`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((ex) => {
          const accentInfo = ACCENT_LABELS[ex.accent];
          return (
            <Card key={ex.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="signal">{ex.level}</Badge>
                    <Badge>{accentInfo.flag} {accentInfo.label}</Badge>
                  </div>
                  <h3 className="mt-2 truncate text-[15px] font-medium text-ink-1">{ex.title}</h3>
                  <p className="mt-0.5 text-[12.5px] text-ink-3">{ex.speaker} · {ex.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(ex.id)}
                  aria-label={`Play ${ex.title}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal text-white transition-transform active:scale-95"
                >
                  <Play size={15} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
