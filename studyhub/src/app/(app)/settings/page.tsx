"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Database, Download, Loader2, Monitor, Moon, Plus, RotateCcw, Sparkles, Sun, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { useTheme, type ThemePreference } from "@/components/providers/theme-provider";
import type { StudyTime, Subject } from "@/lib/types";
import { SCHOOL_CLASSES, SCHOOL_CLASS_STAGE, schoolYearOptions, type SchoolClass } from "@/lib/school";
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
import { RemoveChipButton } from "@/components/shared/remove-chip-button";

const APPEARANCES: { value: ThemePreference; label: string; icon: React.ElementType }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Hell", icon: Sun },
  { value: "dark", label: "Dunkel", icon: Moon },
];

const STUDY_TIMES: { value: StudyTime; label: string }[] = [
  { value: "morning", label: "Morgens" },
  { value: "afternoon", label: "Nachmittags" },
  { value: "evening", label: "Abends" },
  { value: "night", label: "Nachts" },
];

export default function SettingsPage() {
  const state = useStudyStore();
  const profile = useStudyStore((s) => s.profile);
  const updateProfile = useStudyStore((s) => s.updateProfile);
  const deleteSubject = useStudyStore((s) => s.deleteSubject);
  const resetDemoData = useStudyStore((s) => s.resetDemoData);
  const clearAllData = useStudyStore((s) => s.clearAllData);
  const { theme, preference, setPreference } = useTheme();

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

  // Keep whatever the profile already holds in the list, so a value from an
  // earlier format stays visible and selected instead of silently blanking.
  const yearOptions = [...new Set([...schoolYearOptions(), profile.schoolYear].filter(Boolean))].sort();

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
    toast.success("Daten exportiert");
  }

  const usagePct = Math.round((profile.aiUsage.used / Math.max(1, profile.aiUsage.limit)) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Einstellungen" description="Dein Profil, deine Fächer, das Erscheinungsbild und deine Daten." />

      <div className="space-y-5">
        {/* ── Profile ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Wie StudyHub dich anspricht — und wo du in der Oberschule stehst.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school">Oberschule</Label>
              <Input id="school" value={profile.school} onChange={(e) => updateProfile({ school: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grade">Klasse</Label>
              <Select value={profile.grade} onValueChange={(v) => updateProfile({ grade: v })}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Klasse wählen" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_CLASSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} · {SCHOOL_CLASS_STAGE[value as SchoolClass]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schoolYear">Schuljahr</Label>
              <Select value={profile.schoolYear} onValueChange={(v) => updateProfile({ schoolYear: v })}>
                <SelectTrigger id="schoolYear">
                  <SelectValue placeholder="Schuljahr wählen" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bevorzugte Lernzeit</Label>
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
              <Label>Lernziele</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.learningGoals.map((g) => (
                  <Badge key={g} variant="outline" className="gap-1">
                    {g}
                    <RemoveChipButton label={g} onClick={() => updateProfile({ learningGoals: profile.learningGoals.filter((x) => x !== g) })} />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Ziel eingeben und Enter drücken…"
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
              <CardTitle>Fächer</CardTitle>
              <CardDescription>Fächer hinzufügen, umbenennen oder entfernen.</CardDescription>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSubjectDialog({ open: true })}>
              <Plus className="size-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {state.subjects.length === 0 ? (
              <p className="t-callout text-ink-3">No subjects yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {state.subjects.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <SubjectIcon subject={s} size={14} />
                    <span className="min-w-0 flex-1 truncate t-callout text-ink">{s.name}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => setSubjectDialog({ open: true, subject: s })}>
                      <span className="t-caption">Edit</span>
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
            <CardTitle>Erscheinungsbild</CardTitle>
            <CardDescription>
              StudyHub folgt standardmäßig dem Erscheinungsbild deines Systems, wechselt also mit allem
              anderen auf deinem Gerät mit. Wähl Hell oder Dunkel, um das nur hier zu überschreiben.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="radiogroup"
              aria-label="Erscheinungsbild"
              className="grid max-w-md grid-cols-1 gap-2.5 sm:grid-cols-3"
            >
              {APPEARANCES.map(({ value, label, icon: Icon }) => {
                const selected = preference === value;
                return (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPreference(value)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3.5 py-3 t-callout font-medium transition-colors",
                      selected
                        ? "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-ink"
                        : "border-border bg-surface-2 text-ink-2 hover:border-border-strong"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                    {selected && <Check className="ml-auto size-3.5 shrink-0 text-[var(--color-signal-2)]" />}
                  </button>
                );
              })}
            </div>
            {preference === "system" && (
              <p className="mt-2.5 t-caption text-ink-3">
                Dein System steht gerade auf {theme === "dark" ? "dunkel" : "hell"}.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── AI ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-[var(--color-signal-2)]" /> AI provider
            </CardTitle>
            <CardDescription>Woher StudyHubs Zusammenfassungen, Karteikarten, Quiz und Tutor-Antworten kommen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {aiStatus === "loading" ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="size-2.5 animate-spin" /> Checking…
                </Badge>
              ) : aiStatus === "live" ? (
                <Badge variant="success">Echte KI verbunden</Badge>
              ) : (
                <Badge variant="outline">Demo-KI</Badge>
              )}
            </div>
            <p className="t-callout leading-relaxed text-ink-3">
              {aiStatus === "live" ? (
                <>
                  <code className="rounded bg-surface-2 px-1 py-0.5">ANTHROPIC_API_KEY</code> ist auf dem Server hinterlegt, jede KI-Aktion ruft also das echte Modell auf. Der Schlüssel wird nur serverseitig gelesen und nie an den Browser geschickt.
                </>
              ) : (
                <>
                  Es ist kein API-Schlüssel hinterlegt, StudyHub nutzt also seinen eingebauten Demo-Generator — jede Antwort wird aus deinen eigenen Dokumenten und Notizen abgeleitet, nicht aus Konserven. Für ein echtes Modell trag{" "}
                  <code className="rounded bg-surface-2 px-1 py-0.5">ANTHROPIC_API_KEY</code> in <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code> ein und starte den Server neu.
                </>
              )}
            </p>
            <div>
              <div className="mb-1.5 flex items-center justify-between t-caption">
                <span className="text-ink-3">KI-Nutzung diesen Monat</span>
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
              <Database className="size-4" /> Daten
            </CardTitle>
            <CardDescription>Alles in StudyHub liegt in diesem Browser, unter deinem Konto. Es wird nirgendwohin synchronisiert — ein Export ist die einzige Kopie, die das Löschen der Websitedaten übersteht.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportData}>
              <Download className="size-3.5" /> Als JSON exportieren
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-3.5" /> Demodaten laden
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-danger-text hover:text-danger-text">
              <Trash2 className="size-3.5" /> Alles löschen
            </Button>
          </CardContent>
        </Card>
      </div>

      <SubjectFormDialog open={subjectDialog.open} onOpenChange={(open) => setSubjectDialog({ open })} subject={subjectDialog.subject} />

      {pendingDeleteSubject && (
        <ConfirmDialog
          open={!!pendingDeleteSubject}
          onOpenChange={(o) => !o && setPendingDeleteSubject(null)}
          title={`${pendingDeleteSubject.name} löschen?`}
          description="Seine Dokumente, Stapel und Prüfungen verschwinden mit; Notizen und Aufgaben bleiben, aber ohne Fach."
          onConfirm={() => {
            deleteSubject(pendingDeleteSubject.id);
            toast.success(`${pendingDeleteSubject.name} gelöscht`);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Alles durch Demodaten ersetzen?"
        description="Deine Fächer, Dokumente, Notizen, Stapel und dein Fortschritt werden durch einen erfundenen Beispieldatensatz ersetzt. Exportiere vorher, wenn du behalten willst, was du hast."
        confirmLabel="Demodaten laden"
        onConfirm={() => {
          resetDemoData();
          toast.success("Demodaten geladen");
        }}
      />

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Alle deine Daten löschen?"
        description="Alles — Fächer, Dokumente, Notizen, Stapel, Quiz, Aufgaben und Fortschritt — wird endgültig aus diesem Konto entfernt, und du startest wieder beim Onboarding. Deine Anmeldung bleibt bestehen. Exportiere vorher, wenn du eine Kopie willst."
        confirmLabel="Alles löschen"
        confirmPhrase="DELETE"
        onConfirm={() => {
          clearAllData();
          toast.success("Alle Daten gelöscht");
        }}
      />
    </div>
  );
}
