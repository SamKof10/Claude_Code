"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Moon, Plus, Sparkles, Sun, Sunrise, Sunset, X } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { StudyTime } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_SUBJECTS = ["Mathematics", "English", "Physics", "History", "Italian", "Geography", "Construction", "Chemistry"];
const SUGGESTED_GOALS = [
  "Improve my grades",
  "Prepare for exams",
  "Build a daily study habit",
  "Understand difficult topics",
  "Catch up on missed material",
  "Get more organized",
];
const STUDY_TIMES: { value: StudyTime; label: string; hint: string; icon: React.ElementType }[] = [
  { value: "morning", label: "Morning", hint: "6am – 11am", icon: Sunrise },
  { value: "afternoon", label: "Afternoon", hint: "12pm – 5pm", icon: Sun },
  { value: "evening", label: "Evening", hint: "6pm – 9pm", icon: Sunset },
  { value: "night", label: "Night", hint: "9pm – late", icon: Moon },
];

interface FormState {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  studyTime: StudyTime;
}

const STEPS = ["Name", "School", "Grade", "Subjects", "Goals", "Study time"] as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 t-callout font-medium transition-colors",
        active
          ? "border-transparent signal-gradient text-white"
          : "border-border bg-surface-2 text-ink-2 hover:border-border-strong hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function OnboardingFlow() {
  const completeOnboarding = useStudyStore((s) => s.completeOnboarding);
  // Steps slide horizontally by default; under Reduce Motion they cross-fade.
  const reduceMotion = useReducedMotion();
  const [step, setStep] = React.useState(0);
  const [customSubject, setCustomSubject] = React.useState("");
  const [form, setForm] = React.useState<FormState>({
    name: "",
    school: "",
    grade: "",
    subjects: [],
    goals: [],
    studyTime: "evening",
  });

  const isLast = step === STEPS.length - 1;
  const canContinue =
    (step === 0 && form.name.trim().length > 0) ||
    (step === 1 && form.school.trim().length > 0) ||
    (step === 2 && form.grade.trim().length > 0) ||
    (step === 3 && form.subjects.length > 0) ||
    step === 4 ||
    step === 5;

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  function finish() {
    completeOnboarding({
      name: form.name.trim(),
      school: form.school.trim(),
      grade: form.grade.trim(),
      schoolYear: `${new Date().getFullYear()} / ${new Date().getFullYear() + 1}`,
      learningGoals: form.goals,
      preferredStudyTime: form.studyTime,
      subjectNames: form.subjects,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bg px-4 dot-grid">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl signal-gradient shadow-lg">
            <Sparkles className="size-[18px] text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">StudyHub</span>
        </div>

        <div className="mb-6 flex justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={cn("h-1 w-8 rounded-full transition-colors", i <= step ? "signal-gradient" : "bg-surface-2")} />
          ))}
        </div>

        <div className="card-surface rounded-2xl p-7 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">What should we call you?</h2>
                    <p className="mt-1 t-callout text-ink-3">Your name shows up across StudyHub.</p>
                  </div>
                  <Input
                    autoFocus
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(1)}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">Where do you study?</h2>
                    <p className="mt-1 t-callout text-ink-3">Your school or institution.</p>
                  </div>
                  <Input
                    autoFocus
                    placeholder="School name"
                    value={form.school}
                    onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(2)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">What grade or year are you in?</h2>
                    <p className="mt-1 t-callout text-ink-3">e.g. &ldquo;11th Grade&rdquo; or &ldquo;Year 12&rdquo;.</p>
                  </div>
                  <Input
                    autoFocus
                    placeholder="Grade / year"
                    value={form.grade}
                    onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(3)}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">Which subjects are you taking?</h2>
                    <p className="mt-1 t-callout text-ink-3">Pick as many as you like — you can add more later.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SUBJECTS.map((s) => (
                      <Chip key={s} active={form.subjects.includes(s)} onClick={() => setForm((f) => ({ ...f, subjects: toggle(f.subjects, s) }))}>
                        {s}
                      </Chip>
                    ))}
                    {form.subjects
                      .filter((s) => !SUGGESTED_SUBJECTS.includes(s))
                      .map((s) => (
                        <Chip key={s} active onClick={() => setForm((f) => ({ ...f, subjects: toggle(f.subjects, s) }))}>
                          {s} <X className="ml-1 inline size-3" />
                        </Chip>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add another subject…"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customSubject.trim()) {
                          setForm((f) => ({ ...f, subjects: [...f.subjects, customSubject.trim()] }));
                          setCustomSubject("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        if (customSubject.trim()) {
                          setForm((f) => ({ ...f, subjects: [...f.subjects, customSubject.trim()] }));
                          setCustomSubject("");
                        }
                      }}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">What are you hoping to get out of StudyHub?</h2>
                    <p className="mt-1 t-callout text-ink-3">Optional — helps us prioritize what to show you.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_GOALS.map((g) => (
                      <Chip key={g} active={form.goals.includes(g)} onClick={() => setForm((f) => ({ ...f, goals: toggle(f.goals, g) }))}>
                        {g}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">When do you usually study?</h2>
                    <p className="mt-1 t-callout text-ink-3">We&apos;ll time reminders and suggestions around this.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STUDY_TIMES.map(({ value, label, hint, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, studyTime: value }))}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors",
                          form.studyTime === value ? "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)]" : "border-border bg-surface-2 hover:border-border-strong"
                        )}
                      >
                        <Icon className={cn("size-4", form.studyTime === value ? "text-[var(--color-signal-2)]" : "text-ink-3")} />
                        <div>
                          <p className="t-callout font-medium text-ink">{label}</p>
                          <p className="t-caption text-ink-3">{hint}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn(step === 0 && "invisible")}>
              <ArrowLeft className="size-3.5" /> Back
            </Button>
            {isLast ? (
              <Button size="sm" onClick={finish}>
                Enter StudyHub <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button size="sm" disabled={!canContinue} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                Continue <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
