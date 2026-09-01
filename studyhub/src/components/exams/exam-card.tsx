"use client";

import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Exam, Subject } from "@/lib/types";
import { examReadiness } from "@/lib/analytics";
import { formatDateShort } from "@/lib/date-format";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ExamCard({ exam, subject, onDelete }: { exam: Exam; subject: Subject | null | undefined; onDelete: () => void }) {
  const daysLeft = differenceInCalendarDays(new Date(exam.date), new Date());
  const readiness = examReadiness(exam);

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink">
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

      <Link href={`/exams/${exam.id}`} className="block">
        <div className="pr-8">
          <h3 className="t-body font-semibold text-ink">{exam.title}</h3>
          <p className="t-caption text-ink-3">{formatDateShort(exam.date)}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "outline"}>
            {daysLeft < 0 ? "Vorbei" : daysLeft === 0 ? "Heute" : `noch ${daysLeft} T`}
          </Badge>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between t-caption">
            <span className="text-ink-3">Bereitschaft</span>
            <span className="font-medium text-ink">{readiness}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${readiness >= 70 ? "bg-success" : readiness >= 40 ? "bg-warning" : "bg-danger"}`}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        {exam.topics.length > 0 && <p className="mt-3 line-clamp-1 t-caption text-ink-3">{exam.topics.join(" · ")}</p>}
      </Link>
    </div>
  );
}
