"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Plus } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { Exam } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExamCard } from "@/components/exams/exam-card";
import { ExamFormDialog } from "@/components/exams/exam-form-dialog";
import { Button } from "@/components/ui/button";

export default function ExamsPage() {
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const exams = useStudyStore((s) => s.exams);
  const deleteExam = useStudyStore((s) => s.deleteExam);
  const [formOpen, setFormOpen] = React.useState(searchParams.get("new") === "1");
  const [pendingDelete, setPendingDelete] = React.useState<Exam | null>(null);
  const bySubject = new Map(subjects.map((s) => [s.id, s]));

  const sorted = [...exams].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  return (
    <div>
      <PageHeader
        title="Exams"
        description="Tell StudyHub what's coming up and it builds the prep plan for you."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-3.5" /> New exam
          </Button>
        }
      />

      {exams.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No exams scheduled"
          description="Add an exam with its date and topics, and StudyHub generates a week-by-week study plan automatically."
          action={<Button onClick={() => setFormOpen(true)}>Schedule your first exam</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((exam) => (
            <ExamCard key={exam.id} exam={exam} subject={bySubject.get(exam.subjectId)} onDelete={() => setPendingDelete(exam)} />
          ))}
        </div>
      )}

      <ExamFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`Delete "${pendingDelete.title}"?`}
          description="This can't be undone."
          onConfirm={() => {
            deleteExam(pendingDelete.id);
            toast.success("Exam deleted");
          }}
        />
      )}
    </div>
  );
}
