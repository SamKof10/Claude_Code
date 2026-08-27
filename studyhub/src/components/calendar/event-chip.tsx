"use client";

import { CheckSquare, GraduationCap, NotebookPen } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { subjectColorVar } from "@/lib/icon-map";
import type { Subject } from "@/lib/types";

const KIND_ICON = { exam: GraduationCap, task: CheckSquare, session: NotebookPen } as const;

export function EventChip({ event, subject, onClick, dense }: { event: CalendarEvent; subject?: Subject | null; onClick: () => void; dense?: boolean }) {
  const Icon = KIND_ICON[event.kind];
  const color = subject ? subjectColorVar(subject.color) : event.kind === "exam" ? "var(--color-signal-2)" : "var(--ink-3)";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left t-caption transition-colors hover:bg-surface-2",
        event.done && "opacity-50 line-through",
        dense ? "truncate" : ""
      )}
      style={{ color }}
      title={event.title}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate text-ink-2">{event.title}</span>
    </button>
  );
}
