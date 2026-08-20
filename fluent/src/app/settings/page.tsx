"use client";

import { useState } from "react";
import { Moon, Sun, Trash2 } from "lucide-react";
import { Card, Mono } from "@/components/ui/Primitives";
import { SegmentedControl } from "@/components/ui/Controls";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useStore, type ExplanationLanguage, type Accent } from "@/lib/store";
import { ACCENT_LABELS } from "@/lib/content/listening";
import { cn } from "@/components/ui/cn";

const ACCENTS: Accent[] = ["british", "american", "australian", "irish", "canadian"];

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[14px] font-medium text-ink-1">{label}</p>
        {description ? <p className="mt-0.5 text-[12.5px] text-ink-3">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { state, setTheme, setExplanationLanguage, setAccent, setDailyGoal, resetProgress } = useStore();
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Settings</h1>
          <p className="lede mt-2 max-w-xl">Tune the app to how you actually learn.</p>
        </div>
      </Reveal>

      <Card className="p-6 sm:p-7">
        <Row label="Appearance" description="Dark is the default — this is meant to feel like an operating system, not a school site.">
          <SegmentedControl
            value={state.theme}
            onChange={setTheme}
            options={[
              { value: "dark", label: <span className="flex items-center gap-1.5"><Moon size={13} /> Dark</span> },
              { value: "light", label: <span className="flex items-center gap-1.5"><Sun size={13} /> Light</span> },
            ]}
          />
        </Row>

        <Row label="Explanation language" description="How explanations are written. Adaptive shifts toward English as your level rises.">
          <SegmentedControl<ExplanationLanguage>
            value={state.explanationLanguage}
            onChange={setExplanationLanguage}
            options={[
              { value: "de", label: "🇩🇪 German" },
              { value: "en", label: "🇬🇧 English" },
              { value: "adaptive", label: "Adaptive" },
            ]}
          />
        </Row>

        <Row label="Accent preference" description="Default accent for listening exercises.">
          <div className="flex flex-wrap gap-1.5">
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccent(a)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  state.accent === a ? "border-signal/50 bg-signal/10 text-signal-soft" : "border-[var(--line)] text-ink-3 hover:text-ink-1",
                )}
              >
                {ACCENT_LABELS[a].flag} {ACCENT_LABELS[a].label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Daily goal" description={`${state.dailyGoalMinutes} minutes per day`}>
          <div className="flex w-full items-center gap-3 sm:w-64">
            <input
              type="range"
              min={15}
              max={90}
              step={5}
              value={state.dailyGoalMinutes}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="range w-full"
            />
            <Mono className="w-10 shrink-0 text-right text-ink-2">{state.dailyGoalMinutes}m</Mono>
          </div>
        </Row>

        <Row label="Reduce motion" description="Handled automatically via your system's reduced-motion setting.">
          <span className="mono text-mint">automatic</span>
        </Row>
      </Card>

      <Card className="border-coral/25 p-6 sm:p-7">
        <Row label="Reset demo progress" description="Clears streak, vocabulary progress, sessions and stats stored on this device.">
          {confirmingReset ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={() => { resetProgress(); setConfirmingReset(false); }}>
                Confirm reset
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmingReset(true)}>
              <Trash2 size={14} /> Reset
            </Button>
          )}
        </Row>
      </Card>
    </div>
  );
}
