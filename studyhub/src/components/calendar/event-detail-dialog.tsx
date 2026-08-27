"use client";

import Link from "next/link";
import { CheckSquare, GraduationCap, NotebookPen } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar";
import type { Subject } from "@/lib/types";
import { formatDateLong } from "@/lib/date-format";
import { format } from "date-fns";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const KIND_ICON = { exam: GraduationCap, task: CheckSquare, session: NotebookPen } as const;
const KIND_LABEL = { exam: "Exam", task: "Task", session: "Study session" } as const;

export function EventDetailDialog({ event, subject, onOpenChange }: { event: CalendarEvent | null; subject: Subject | null | undefined; onOpenChange: (open: boolean) => void }) {
  if (!event) return null;
  const Icon = KIND_ICON[event.kind];

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
              <Icon className="size-4" />
            </div>
            <Badge variant="outline">{KIND_LABEL[event.kind]}</Badge>
          </div>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            {formatDateLong(event.date)} at {format(new Date(event.date), "h:mm a")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          {event.meta && <Badge variant="outline">{event.meta}</Badge>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <Link href={event.href}>Open</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
