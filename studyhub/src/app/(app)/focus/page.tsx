"use client";

import * as React from "react";
import { Brain, Clock3, Coffee, Pause, Play, RotateCcw, SkipForward, SlidersHorizontal, Target } from "lucide-react";
import { useNow } from "@/lib/clock";
import { useStudyStore } from "@/lib/store";
import {
  PHASE_LABEL,
  phaseMinutes,
  useFocusStore,
  type FocusPhase,
  type FocusSettings,
} from "@/lib/store/focus";
import { clamp, cn, formatMinutes } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SubjectPill } from "@/components/shared/subject-pill";
import { FocusRing } from "@/components/focus/focus-ring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PHASES: { value: FocusPhase; icon: React.ElementType }[] = [
  { value: "focus", icon: Brain },
  { value: "short-break", icon: Coffee },
  { value: "long-break", icon: Coffee },
];

const NO_SUBJECT = "__none__";

const DURATION_FIELDS: { key: keyof FocusSettings; label: string; min: number; max: number }[] = [
  { key: "focusMinutes", label: "Focus block", min: 5, max: 120 },
  { key: "shortBreakMinutes", label: "Short break", min: 1, max: 30 },
  { key: "longBreakMinutes", label: "Long break", min: 5, max: 60 },
  { key: "roundsBeforeLongBreak", label: "Blocks before long break", min: 2, max: 8 },
];

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export default function FocusPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const sessions = useStudyStore((s) => s.sessions);

  const phase = useFocusStore((s) => s.phase);
  const status = useFocusStore((s) => s.status);
  const endsAt = useFocusStore((s) => s.endsAt);
  const remainingMs = useFocusStore((s) => s.remainingMs);
  const subjectId = useFocusStore((s) => s.subjectId);
  const round = useFocusStore((s) => s.round);
  const settings = useFocusStore((s) => s.settings);
  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const reset = useFocusStore((s) => s.reset);
  const skip = useFocusStore((s) => s.skip);
  const selectPhase = useFocusStore((s) => s.selectPhase);
  const setSubject = useFocusStore((s) => s.setSubject);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  const now = useNow();
  const totalMs = phaseMinutes(phase, settings) * 60_000;
  // While running the deadline is the truth; otherwise it is whatever is banked.
  const msLeft = status === "running" && endsAt !== null && now > 0 ? Math.max(0, endsAt - now) : remainingMs;

  const focusSessions = sessions.filter((s) => s.type === "focus");
  const todaySessions = focusSessions.filter((s) => isToday(s.date));
  const minutesToday = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const recent = [...focusSessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const activeSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div>
      <PageHeader
        title="Focus"
        description="Work in timed blocks. Every finished focus block is logged as study time, so it shows up in Progress and keeps your streak alive."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div role="group" aria-label="Timer phase" className="mx-auto mb-7 flex w-fit gap-1 rounded-xl border border-border bg-surface-2 p-1">
                {PHASES.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectPhase(value)}
                    aria-pressed={phase === value}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-lg px-3 t-callout font-medium transition-colors",
                      phase === value ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {PHASE_LABEL[value]}
                  </button>
                ))}
              </div>

              <FocusRing phase={phase} status={status} msLeft={msLeft} totalMs={totalMs} />

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                {status === "running" ? (
                  <Button size="lg" variant="secondary" onClick={pause} className="min-w-[132px]">
                    <Pause className="size-4" /> Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={status === "paused" ? resume : start} className="min-w-[132px]">
                    <Play className="size-4" /> {status === "paused" ? "Resume" : "Start"}
                  </Button>
                )}
                <Button size="lg" variant="ghost" onClick={reset} disabled={status === "idle" && msLeft === totalMs}>
                  <RotateCcw className="size-4" /> Reset
                </Button>
                <Button size="lg" variant="ghost" onClick={skip}>
                  <SkipForward className="size-4" /> Skip
                </Button>
              </div>

              <div className="mt-7 flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5" aria-label={`Block ${(round % settings.roundsBeforeLongBreak) + 1} of ${settings.roundsBeforeLongBreak} before a long break`}>
                  {Array.from({ length: settings.roundsBeforeLongBreak }).map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 rounded-full",
                        i < round % settings.roundsBeforeLongBreak || (round > 0 && round % settings.roundsBeforeLongBreak === 0)
                          ? "bg-[var(--color-signal)]"
                          : "bg-surface-2"
                      )}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Label htmlFor="focus-subject" className="t-caption text-ink-3">
                    Credit this block to
                  </Label>
                  <Select
                    value={subjectId ?? NO_SUBJECT}
                    onValueChange={(v) => setSubject(v === NO_SUBJECT ? null : v)}
                  >
                    <SelectTrigger id="focus-subject" className="w-52">
                      <SelectValue placeholder="No subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SUBJECT}>No subject</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={Clock3} label="Focused today" value={minutesToday > 0 ? formatMinutes(minutesToday) : "0m"} />
            <StatCard icon={Target} label="Blocks today" value={todaySessions.length} />
            <StatCard
              icon={Brain}
              label="Block length"
              value={`${settings.focusMinutes}m`}
              hint={`${settings.shortBreakMinutes}m break · ${settings.longBreakMinutes}m long`}
            />
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-4" /> Timer
              </CardTitle>
              <CardDescription>Changes apply to the next block — a run in progress is never cut short.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DURATION_FIELDS.map(({ key, label, min, max }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={`focus-${key}`} className="t-callout font-normal text-ink-2">
                    {label}
                  </Label>
                  <Input
                    id={`focus-${key}`}
                    type="number"
                    min={min}
                    max={max}
                    value={settings[key] as number}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      if (Number.isNaN(parsed)) return;
                      updateSettings({ [key]: clamp(parsed, min, max) });
                    }}
                    className="h-8 w-20 text-right tabular-nums"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <Label htmlFor="focus-auto" className="t-callout font-normal text-ink-2">
                  Start the next block automatically
                </Label>
                <Switch
                  id="focus-auto"
                  checked={settings.autoStartNext}
                  onCheckedChange={(v) => updateSettings({ autoStartNext: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="focus-chime" className="t-callout font-normal text-ink-2">
                  Play a chime when a block ends
                </Label>
                <Switch id="focus-chime" checked={settings.chime} onCheckedChange={(v) => updateSettings({ chime: v })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent blocks</CardTitle>
              <CardDescription>
                {activeSubject ? `New blocks are credited to ${activeSubject.name}.` : "Blocks without a subject still count towards your total study time."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="t-callout text-ink-3">Nothing yet. Finish a block and it shows up here.</p>
              ) : (
                <ul className="space-y-2.5">
                  {recent.map((session) => {
                    const subject = subjects.find((s) => s.id === session.subjectId);
                    return (
                      <li key={session.id} className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="t-callout font-medium text-ink tabular-nums">{formatMinutes(session.durationMinutes)}</span>
                          {subject && <SubjectPill subject={subject} />}
                        </div>
                        <span className="shrink-0 t-caption text-ink-3">{formatDateShort(session.date)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
