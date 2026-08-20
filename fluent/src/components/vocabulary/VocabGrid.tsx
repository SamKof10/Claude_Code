"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { VOCAB_WORDS } from "@/lib/content/vocabulary";
import { useStore } from "@/lib/store";
import { WordStateBadge, vocabState } from "./WordStateBadge";
import { VocabCard } from "./VocabCard";

const LEVELS = ["All", "B2", "B2+", "C1", "C2"] as const;

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        active ? "border-signal/50 bg-signal/10 text-signal-soft" : "border-[var(--line)] text-ink-3 hover:text-ink-1",
      )}
    >
      {children}
    </button>
  );
}

export function VocabGrid() {
  const { state } = useStore();
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const words = useMemo(
    () => VOCAB_WORDS.filter((w) => level === "All" || w.level === level),
    [level],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <FilterChip key={l} active={level === l} onClick={() => setLevel(l)}>
            {l}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {words.map((w) => {
          const wState = vocabState(state.vocab, w.id);
          const open = openId === w.id;
          return (
            <Card key={w.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : w.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span className="flex-1 truncate text-[14.5px] font-medium text-ink-1">{w.word}</span>
                <span className="hidden text-[12.5px] text-ink-3 sm:block">{w.meaning}</span>
                <WordStateBadge state={wState} />
                <ChevronDown size={16} className={cn("shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
              </button>
              {open ? (
                <div className="border-t border-[var(--line)] px-5 py-5">
                  <VocabCard word={w} state={wState} />
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
