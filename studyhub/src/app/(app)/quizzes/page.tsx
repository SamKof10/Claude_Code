"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ListChecks, Plus } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { Quiz } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QuizListItem } from "@/components/quizzes/quiz-list-item";
import { Button } from "@/components/ui/button";

export default function QuizzesPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const quizzes = useStudyStore((s) => s.quizzes);
  const deleteQuiz = useStudyStore((s) => s.deleteQuiz);
  const [pendingDelete, setPendingDelete] = React.useState<Quiz | null>(null);
  const bySubject = new Map(subjects.map((s) => [s.id, s]));

  const sorted = [...quizzes].sort((a, b) => +new Date(b.completedAt ?? b.createdAt) - +new Date(a.completedAt ?? a.createdAt));
  const completed = sorted.filter((q) => q.status === "completed");
  const avgScore = completed.length ? Math.round(completed.reduce((a, q) => a + (q.score ?? 0), 0) / completed.length) : null;

  return (
    <div>
      <PageHeader
        title="Quizzes"
        description="Test yourself and see exactly what to review next."
        actions={
          <Button asChild>
            <Link href="/quizzes/new">
              <Plus className="size-3.5" /> Generate quiz
            </Link>
          </Button>
        }
      />

      {quizzes.length > 0 && (
        <div className="mb-5 flex gap-4 text-[13px] text-ink-3">
          <span>
            <strong className="text-ink">{quizzes.length}</strong> total
          </span>
          <span>
            <strong className="text-ink">{completed.length}</strong> completed
          </span>
          {avgScore != null && (
            <span>
              <strong className="text-ink">{avgScore}%</strong> average score
            </span>
          )}
        </div>
      )}

      {quizzes.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No quizzes yet"
          description="Generate a quiz from a document, note, subject or topic — StudyHub will grade it and tell you exactly what to revise."
          action={
            <Button asChild>
              <Link href="/quizzes/new">Generate your first quiz</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {sorted.map((quiz) => (
            <QuizListItem key={quiz.id} quiz={quiz} subject={quiz.subjectId ? bySubject.get(quiz.subjectId) : null} onDelete={() => setPendingDelete(quiz)} />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`Delete "${pendingDelete.title}"?`}
          description="This can't be undone."
          onConfirm={() => {
            deleteQuiz(pendingDelete.id);
            toast.success("Quiz deleted");
          }}
        />
      )}
    </div>
  );
}
