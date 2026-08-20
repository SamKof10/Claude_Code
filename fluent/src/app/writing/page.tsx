"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WritingEditor } from "@/components/writing/WritingEditor";
import { WRITING_TASKS, WRITING_TYPE_LABELS } from "@/lib/content/writing";

export default function WritingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const task = WRITING_TASKS.find((t) => t.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Writing Lab</h1>
          <p className="lede mt-2 max-w-xl">
            Emails, essays, applications and more — with feedback on grammar, vocabulary, structure and C1 markers.
          </p>
        </div>
      </Reveal>

      {task ? (
        <WritingEditor task={task} onBack={() => setSelected(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WRITING_TASKS.map((t) => (
            <Card key={t.id} className="p-5">
              <button type="button" onClick={() => setSelected(t.id)} className="flex w-full items-start gap-3 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-signal">
                  <PenLine size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <Badge tone="signal">{WRITING_TYPE_LABELS[t.type]}</Badge>
                  <p className="mt-2 text-[14px] font-medium text-ink-1">{t.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-3">{t.minWords}–{t.maxWords} words</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
