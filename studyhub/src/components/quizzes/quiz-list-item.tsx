"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, ListChecks, MoreHorizontal, Trash2 } from "lucide-react";
import type { Quiz, Subject } from "@/lib/types";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}

export function QuizListItem({ quiz, subject, onDelete }: { quiz: Quiz; subject: Subject | null | undefined; onDelete: () => void }) {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-border-strong">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        {quiz.status === "draft" ? <ListChecks className="size-4" /> : <CircleDot className="size-4" />}
      </div>
      <Link href={`/quizzes/${quiz.id}`} className="min-w-0 flex-1">
        <p className="truncate t-body font-medium text-ink">{quiz.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          <Badge variant="outline">{quiz.questions.length} questions</Badge>
          <Badge variant="outline">{quiz.difficulty}</Badge>
          {quiz.status === "completed" && typeof quiz.score === "number" && <Badge variant={scoreTone(quiz.score)}>{quiz.score}%</Badge>}
          {quiz.status === "in-progress" && <Badge variant="signal">In progress</Badge>}
          {quiz.status === "draft" && <Badge variant="outline">Not started</Badge>}
        </div>
      </Link>
      <span className="hidden shrink-0 t-caption text-ink-3 sm:block">
        {formatDistanceToNow(new Date(quiz.completedAt ?? quiz.createdAt), { addSuffix: true })}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex size-7 shrink-0 items-center justify-center rounded-md text-ink-3 opacity-0 transition-opacity hover:bg-surface-2 hover:text-ink group-hover:opacity-100">
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
