"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Database, Download, Loader2, Moon, Plus, RotateCcw, Sparkles, Sun, Trash2, X } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { useTheme } from "@/components/providers/theme-provider";
import type { StudyTime, Subject } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SubjectIcon } from "@/components/shared/subject-pill";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STUDY_TIMES: { value: StudyTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export default function SettingsPage() {
  const state = useStudyStore();
  const profile = useStudyStore((s) => s.profile);
  const updateProfile = useStudyStore((s) => s.updateProfile);
  const deleteSubject = useStudyStore((s) => s.deleteSubject);
  const resetDemoData = useStudyStore((s) => s.resetDemoData);
  const clearAllData = useStudyStore((s) => s.clearAllData);
  const { theme, setTheme } = useTheme();

  const [subjectDialog, setSubjectDialog] = React.useState<{ open: boolean; subject?: Subject }>({ open: false });
  const [pendingDeleteSubject, setPendingDeleteSubject] = React.useState<Subject | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [goalInput, setGoalInput] = React.useState("");
  const [aiStatus, setAiStatus] = React.useState<"loading" | "live" | "demo">("loading");

  React.useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d) => setAiStatus(d.liveConfigured ? "live" : "demo"))
      .catch(() => setAiStatus("demo"));
  }, []);

  if (!profile) return null;

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      subjects: state.subjects,
      documents: state.documents,
      notes: state.notes,
      decks: state.decks,
      flashcards: state.flashcards,
      quizzes: state.quizzes,
      tasks: state.tasks,
      exams: state.exams,
      sessions: state.sessions,
      conversations: state.conversations,
      messages: state.messages,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studyhub-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  }

  const usagePct = Math.round((profile.aiUsage.used / Math.max(1, profile.aiUsage.limit)) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Your profile, subjects, appearance and data." />

      <div className="space-y-5">
        {/* ── Profile ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>How StudyHub addresses you and frames your school year.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school">School</Label>
              <Input id="school" value={profile.school} onChange={(e) => updateProfile({ school: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grade">Grade / year</Label>
              <Input id="grade" value={profile.grade} onChange={(e) => updateProfile({ grade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schoolYear">School year</Label>
              <Input id="schoolYear" value={profile.schoolYear} onChange={(e) => updateProfile({ schoolYear: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Preferred study time</Label>
              <Select value={profile.preferredStudyTime} onValueChange={(v) => updateProfile({ preferredStudyTime: v as StudyTime })}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Learning goals</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.learningGoals.map((g) => (
                  <Badge key={g} variant="outline" className="gap-1">
                    {g}
                    <button onClick={() => updateProfile({ learningGoals: profile.learningGoals.filter((x) => x !== g) })} className="hover:text-danger">
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a goal and press Enter…"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && goalInput.trim()) {
                    updateProfile({ learningGoals: [...profile.learningGoals, goalInput.trim()] });
                    setGoalInput("");
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Subjects ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Add, rename or remove the subjects you&apos;re taking.</CardDescription>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSubjectDialog({ open: true })}>
              <Plus className="size-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {state.subjects.length === 0 ? (
              <p className="text-[12.5px] text-ink-3">No subjects yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {state.subjects.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <SubjectIcon subject={s} size={14} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{s.name}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => setSubjectDialog({ open: true, subject: s })}>
                      <span className="text-[11px]">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setPendingDeleteSubject(s)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Appearance ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>StudyHub is designed dark-first, but light mode is fully supported.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid max-w-sm grid-cols-2 gap-2.5">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-3 text-[13px] font-medium transition-colors",
                    theme === t ? "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-ink" : "border-border bg-surface-2 text-ink-2 hover:border-border-strong"
                  )}
                >
                  {t === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  <span className="capitalize">{t}</span>
                  {theme === t && <Check className="ml-auto size-3.5 text-[var(--color-signal-2)]" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── AI ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-[var(--color-signal-2)]" /> AI provider
            </CardTitle>
            <CardDescription>Where StudyHub&apos;s summaries, flashcards, quizzes and tutor answers come from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {aiStatus === "loading" ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="size-2.5 animate-spin" /> Checking…
                </Badge>
              ) : aiStatus === "live" ? (
                <Badge variant="success">Live AI connected</Badge>
              ) : (
                <Badge variant="outline">Demo AI</Badge>
              )}
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-3">
              {aiStatus === "live" ? (
                <>
                  <code className="rounded bg-surface-2 px-1 py-0.5">ANTHROPIC_API_KEY</code> is configured on the server, so every AI action calls the real model. The key is read server-side only and is never sent to the browser.
                </>
              ) : (
                <>
                  No API key is configured, so StudyHub runs its built-in demo generator — every response is derived from your own documents and notes rather than canned text. To switch to a real model, set{" "}
                  <code className="rounded bg-surface-2 px-1 py-0.5">ANTHROPIC_API_KEY</code> in <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code> and restart the server.
                </>
              )}
            </p>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[12px]">
                <span className="text-ink-3">AI usage this month</span>
                <span className="text-ink">
                  {profile.aiUsage.used} / {profile.aiUsage.limit}
                </span>
              </div>
              <Progress value={usagePct} />
            </div>
          </CardContent>
        </Card>

        {/* ── Data ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Database className="size-4" /> Data
            </CardTitle>
            <CardDescription>All StudyHub data lives in your browser (localStorage) until a backend is connected.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportData}>
              <Download className="size-3.5" /> Export as JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-3.5" /> Reset demo data
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-danger hover:text-danger">
              <Trash2 className="size-3.5" /> Delete everything
            </Button>
          </CardContent>
        </Card>
      </div>

      <SubjectFormDialog open={subjectDialog.open} onOpenChange={(open) => setSubjectDialog({ open })} subject={subjectDialog.subject} />

      {pendingDeleteSubject && (
        <ConfirmDialog
          open={!!pendingDeleteSubject}
          onOpenChange={(o) => !o && setPendingDeleteSubject(null)}
          title={`Delete ${pendingDeleteSubject.name}?`}
          description="Its documents, decks and exams are deleted too; notes and tasks are kept but unassigned."
          onConfirm={() => {
            deleteSubject(pendingDeleteSubject.id);
            toast.success(`${pendingDeleteSubject.name} deleted`);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset to demo data?"
        description="This replaces everything currently in StudyHub with a fresh set of example subjects, documents, decks and progress."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemoData();
          toast.success("Demo data restored");
        }}
      />

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Delete all your data?"
        description="Everything — subjects, documents, notes, decks, quizzes, tasks and progress — is permanently removed and you'll start from onboarding again. Export first if you want a copy."
        confirmLabel="Delete everything"
        onConfirm={() => {
          clearAllData();
          toast.success("All data deleted");
        }}
      />
    </div>
  );
}
