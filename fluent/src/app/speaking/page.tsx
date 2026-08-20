"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { SPEAKING_PROMPTS } from "@/lib/content/speaking";

export default function SpeakingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const prompt = SPEAKING_PROMPTS.find((p) => p.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Speaking</h1>
          <p className="lede mt-2 max-w-xl">
            Speak out loud, get a demo analysis, and see how to sound more natural — not just grammatically correct.
          </p>
        </div>
      </Reveal>

      {prompt ? (
        <SpeakingPractice key={prompt.id} prompt={prompt} onBack={() => setSelected(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SPEAKING_PROMPTS.map((p) => (
            <Card key={p.id} className="p-5">
              <button type="button" onClick={() => setSelected(p.id)} className="flex w-full items-start gap-3 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-signal">
                  <Mic size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <Badge tone="signal">{p.level}</Badge>
                  <p className="mt-2 text-[14px] leading-snug font-medium text-ink-1">{p.prompt}</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
