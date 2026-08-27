"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { differenceInCalendarDays, format } from "date-fns";
import { ArrowLeft, Check, GraduationCap, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { examReadiness } from "@/lib/analytics";
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
        <p className="text-[14px] font-medium text-ink">Exam not found</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/exams">
            <ArrowLeft className="size-3.5" /> Back to exams
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
            <h1 className="text-[19px] font-semibold tracking-tight text-ink">{exam.title}</h1>
            <p className="mt-0.5 text-[13px] text-ink-3">{format(new Date(exam.date), "EEEE, MMMM d, yyyy")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {subject && <SubjectPill subject={subject} />}
              <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "outline"}>
                {daysLeft < 0 ? "Past" : daysLeft === 0 ? "Today" : `${daysLeft} days left`}
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
          <span className="mono-label">Readiness</span>
          <span className="text-[13px] font-semibold text-ink">{readiness}%</span>
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

      <h2 className="mb-4 text-[15px] font-semibold text-ink">Study plan</h2>
      <div className="relative space-y-6 pl-8">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        {exam.studyPlan.map((week) => (
          <div key={week.weekNumber} className="relative">
            <button
              onClick={() => toggleStudyPlanWeek(exam.id, week.weekNumber)}
              className={cn(
                "absolute -left-8 top-0.5 flex size-6 items-center justify-center rounded-full border-2 transition-colors",
                week.done ? "border-success bg-success text-white" : "border-border-strong bg-surface text-ink-3 hover:border-[var(--color-signal)]"
              )}
            >
              {week.done && <Check className="size-3.5" />}
            </button>
            <div className={cn("rounded-xl border border-border bg-surface p-4", week.done && "opacity-60")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-ink">{week.label}</p>
                <span className="text-[11px] text-ink-3">
                  {format(new Date(week.startDate), "MMM d")} – {format(new Date(week.endDate), "MMM d")}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {week.topics.map((t) => (
                  <Badge key={t} variant="signal">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-2.5 text-[12.5px] text-ink-2">{week.focus}</p>
            </div>
          </div>
        ))}
        <div className="relative">
          <div className="absolute -left-8 top-0.5 flex size-6 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-ink-3">
            <GraduationCap className="size-3.5" />
          </div>
          <div className="rounded-xl border border-dashed border-border p-4 text-[12.5px] text-ink-3">Exam day — {format(new Date(exam.date), "EEEE, MMMM d")}</div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${exam.title}"?`}
        description="This can't be undone."
        onConfirm={() => {
          deleteExam(exam.id);
          toast.success("Exam deleted");
          router.push("/exams");
        }}
      />
    </div>
  );
}
