"use client";

import { Clock, MoreHorizontal, Repeat, Trash2 } from "lucide-react";
import type { StudyTask, Subject } from "@/lib/types";
import { formatDueLabel } from "@/lib/date-format";
import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PRIORITY_VARIANT = { high: "danger", medium: "warning", low: "outline" } as const;

export function TaskCard({
  task,
  subject,
  onEdit,
  onDelete,
  onToggleDone,
}: {
  task: StudyTask;
  subject: Subject | null | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDone: () => void;
}) {
  const overdue = task.status !== "done" && task.deadline && new Date(task.deadline) < new Date();

  return (
    <div className={cn("group rounded-xl border bg-surface p-3.5 transition-colors hover:border-border-strong", overdue ? "border-danger/40" : "border-border")}>
      <div className="flex items-start gap-2.5">
        <Checkbox checked={task.status === "done"} onCheckedChange={onToggleDone} className="mt-0.5" />
        <button onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className={cn("t-body font-medium text-ink", task.status === "done" && "line-through text-ink-3")}>{task.title}</p>
          {task.description && <p className="mt-0.5 line-clamp-2 t-caption text-ink-3">{task.description}</p>}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-6 shrink-0 items-center justify-center rounded text-ink-3 opacity-0 transition-opacity hover:bg-surface-2 hover:text-ink group-hover:opacity-100">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>Bearbeiten</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-6">
        {subject && <SubjectPill subject={subject} />}
        <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
          {task.priority}
        </Badge>
        {task.deadline && (
          <Badge variant={overdue ? "danger" : "outline"} className="gap-1">
            <Clock className="size-2.5" /> {formatDueLabel(task.deadline)}
          </Badge>
        )}
        {task.estimatedMinutes && <span className="t-caption text-ink-3">{formatMinutes(task.estimatedMinutes)}</span>}
        {task.recurring && <Repeat className="size-3 text-ink-3" />}
      </div>
    </div>
  );
}
