"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { SubjectPerformance } from "@/lib/analytics";
import { subjectColorVar } from "@/lib/icon-map";
import { formatMinutes } from "@/lib/utils";
import { formatDueLabel } from "@/lib/date-format";
import { SubjectIcon } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SubjectCard({
  perf,
  weakTopics,
  lastActivity,
  onEdit,
  onDelete,
}: {
  perf: SubjectPerformance;
  weakTopics: string[];
  lastActivity: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { subject, progress, quizAverage, studyMinutes30d, nextExam, documentCount } = perf;

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink" onClick={(e) => e.preventDefault()}>
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/subjects/${subject.id}`} className="block">
        <div className="flex items-center gap-3">
          <SubjectIcon subject={subject} size={18} />
          <div className="min-w-0">
            <h3 className="truncate t-headline font-semibold text-ink">{subject.name}</h3>
            <p className="t-caption text-ink-3">{documentCount} document{documentCount === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between t-caption">
            <span className="text-ink-3">Fortschritt</span>
            <span className="font-medium text-ink">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%`, background: subjectColorVar(subject.color) }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 t-caption">
          <div>
            <p className="text-ink-3">Quiz-Schnitt</p>
            <p className="font-medium text-ink">{quizAverage != null ? `${quizAverage}%` : "—"}</p>
          </div>
          <div>
            <p className="text-ink-3">Studied (30d)</p>
            <p className="font-medium text-ink">{studyMinutes30d > 0 ? formatMinutes(studyMinutes30d) : "—"}</p>
          </div>
        </div>

        {nextExam && (
          <div className="mt-3 rounded-lg border border-border bg-surface-2 px-2.5 py-2 t-caption">
            <span className="text-ink-3">Next exam · </span>
            <span className="font-medium text-ink">{nextExam.title}</span>
            <span className="text-ink-3"> · {formatDueLabel(nextExam.date)}</span>
          </div>
        )}

        {weakTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {weakTopics.map((t) => (
              <Badge key={t} variant="warning">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-3 t-caption text-ink-3">
          {lastActivity ? `Aktiv ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true, locale: de })}` : "Noch keine Aktivität"}
        </p>
      </Link>
    </div>
  );
}
