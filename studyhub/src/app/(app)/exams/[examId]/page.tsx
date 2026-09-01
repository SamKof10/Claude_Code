"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { differenceInCalendarDays } from "date-fns";
import { ArrowLeft, Check, GraduationCap, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { examReadiness } from "@/lib/analytics";
import { formatDateLong, formatDateShort } from "@/lib/date-format";
import { SubjectPill } from "@/components/shared/subject-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ExamDetailPage() {
  const params = useParams<{ examId: string }>();
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const exams = useStudyStore((s) => s.exams);
  const toggleStudyPlanWeek = useStudyStore((s) => s.toggleStudyPlanWeek);
  const deleteExam = useStudyStore((s) => s.deleteExam);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const exam = exams.find((e) => e.id === params.examId);
  const subject = exam ? subjects.find((s) => s.id === exam.subjectId) : null;

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Prüfung nicht gefunden</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/exams">
            <ArrowLeft className="size-3.5" /> Zurück zu den Prüfungen
          </Link>
        </Button>
      </div>
    );
  }

  const daysLeft = differenceInCalendarDays(new Date(exam.date), new Date());
  const readiness = examReadiness(exam);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Button variant="ghost" size="icon-sm" className="mt-0.5 shrink-0" asChild>
            <Link href="/exams">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="t-title-2 font-semibold tracking-tight text-ink">{exam.title}</h1>
            <p className="mt-0.5 t-callout text-ink-3">{formatDateLong(exam.date)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {subject && <SubjectPill subject={subject} />}
              <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "outline"}>
                {daysLeft < 0 ? "Vorbei" : daysLeft === 0 ? "Heute" : `noch ${daysLeft} Tage`}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {exam.currentLevel}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="mono-label">Bereitschaft</span>
          <span className="t-callout font-semibold text-ink">{readiness}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div className={cn("h-full rounded-full transition-all", readiness >= 70 ? "bg-success" : readiness >= 40 ? "bg-warning" : "bg-danger")} style={{ width: `${readiness}%` }} />
        </div>
        {exam.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {exam.topics.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <h2 className="mb-4 t-headline font-semibold text-ink">Lernplan</h2>
      <div className="relative space-y-6 pl-8">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        {exam.studyPlan.map((week) => (
          <div key={week.weekNumber} className="relative">
            <button
              onClick={() => toggleStudyPlanWeek(exam.id, week.weekNumber)}
              className={cn(
                "absolute -left-[2.15rem] top-0 flex size-7 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]",
                week.done ? "border-success bg-success text-white" : "border-border-strong bg-surface text-ink-3 hover:border-[var(--color-signal)]"
              )}
            >
              {week.done && <Check className="size-3.5" />}
            </button>
            <div className={cn("rounded-xl border border-border bg-surface p-4", week.done && "opacity-60")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="t-body font-semibold text-ink">{week.label}</p>
                <span className="t-caption text-ink-3">
                  {formatDateShort(week.startDate)} – {formatDateShort(week.endDate)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {week.topics.map((t) => (
                  <Badge key={t} variant="signal">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-2.5 t-callout text-ink-2">{week.focus}</p>
            </div>
          </div>
        ))}
        <div className="relative">
          <div className="absolute -left-8 top-0.5 flex size-6 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-ink-3">
            <GraduationCap className="size-3.5" />
          </div>
          <div className="rounded-xl border border-dashed border-border p-4 t-callout text-ink-3">Prüfungstag — {formatDateLong(exam.date)}</div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`„${exam.title}“ löschen?`}
        description="Das lässt sich nicht rückgängig machen."
        onConfirm={() => {
          deleteExam(exam.id);
          toast.success("Prüfung gelöscht");
          router.push("/exams");
        }}
      />
    </div>
  );
}
