"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ScenarioDialogue } from "@/components/reallife/ScenarioDialogue";
import { SCENARIO_ICONS } from "@/components/reallife/icons";
import { SCENARIOS } from "@/lib/content/scenarios";

export default function RealLifePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = SCENARIOS.find((s) => s.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Real-Life Simulations</h1>
          <p className="lede mt-2 max-w-xl">
            Airport, job interview, doctor&rsquo;s office — practise entirely in English before you need it for real.
          </p>
        </div>
      </Reveal>

      {scenario ? (
        <ScenarioDialogue scenario={scenario} onBack={() => setSelected(null)} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SCENARIOS.map((s) => {
            const Icon = SCENARIO_ICONS[s.icon];
            return (
              <Card key={s.id} className="p-4">
                <button type="button" onClick={() => setSelected(s.id)} className="flex w-full flex-col items-start gap-3 text-left">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-signal">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="text-[13.5px] font-medium text-ink-1">{s.title}</span>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
