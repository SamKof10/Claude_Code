"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { buildCalendarEvents, type CalendarEvent } from "@/lib/calendar";
import type { Subject } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EventChip } from "@/components/calendar/event-chip";
import { EventDetailDialog } from "@/components/calendar/event-detail-dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week" | "day";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const state = useStudyStore();
  const subjects = useStudyStore((s) => s.subjects);
  const bySubject = new Map(subjects.map((s) => [s.id, s]));
  const events = React.useMemo(() => buildCalendarEvents(state), [state]);

  const [view, setView] = React.useState<ViewMode>("month");
  const [anchor, setAnchor] = React.useState(new Date());
  const [selected, setSelected] = React.useState<CalendarEvent | null>(null);

  function eventsOn(day: Date, includeSessions = true) {
    return events.filter((e) => isSameDay(new Date(e.date), day) && (includeSessions || e.kind !== "session"));
  }

  function navigate(dir: -1 | 1) {
    if (view === "month") setAnchor((a) => (dir === 1 ? addMonths(a, 1) : subMonths(a, 1)));
    else if (view === "week") setAnchor((a) => (dir === 1 ? addWeeks(a, 1) : subWeeks(a, 1)));
    else setAnchor((a) => addDays(a, dir));
  }

  const title =
    view === "month"
      ? format(anchor, "MMMM yyyy")
      : view === "week"
        ? `${format(startOfWeek(anchor), "MMM d")} – ${format(endOfWeek(anchor), "MMM d, yyyy")}`
        : format(anchor, "EEEE, MMMM d, yyyy");

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Exams, deadlines and study sessions in one place."
        actions={
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as ViewMode)}>
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
          </ToggleGroup>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <h2 className="t-headline font-semibold text-ink">{title}</h2>
        <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())} className="ml-auto">
          Today
        </Button>
      </div>

      {view === "month" && (
        <MonthView anchor={anchor} eventsOn={eventsOn} bySubject={bySubject} onSelect={setSelected} />
      )}
      {view === "week" && <WeekView anchor={anchor} eventsOn={eventsOn} bySubject={bySubject} onSelect={setSelected} />}
      {view === "day" && <DayView anchor={anchor} eventsOn={eventsOn} bySubject={bySubject} onSelect={setSelected} />}

      <EventDetailDialog event={selected} subject={selected?.subjectId ? bySubject.get(selected.subjectId) : null} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

interface ViewProps {
  anchor: Date;
  eventsOn: (day: Date, includeSessions?: boolean) => CalendarEvent[];
  bySubject: Map<string, Subject>;
  onSelect: (e: CalendarEvent) => void;
}

function MonthView({ anchor, eventsOn, bySubject, onSelect }: ViewProps) {
  const gridStart = startOfWeek(startOfMonth(anchor));
  const gridEnd = endOfWeek(endOfMonth(anchor));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-surface-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-2 py-2 text-center t-caption font-medium text-ink-3">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = eventsOn(day, false);
          const sessionCount = eventsOn(day, true).length - dayEvents.length;
          const inMonth = isSameMonth(day, anchor);
          return (
            <div
              key={day.toISOString()}
              className={cn("min-h-[104px] border-b border-r border-border p-1.5 last:border-r-0", !inMonth && "bg-[var(--bg)] opacity-40")}
            >
              <div className={cn("mb-1 flex size-5 items-center justify-center rounded-full t-caption", isToday(day) ? "signal-gradient text-white font-semibold" : "text-ink-3")}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventChip key={e.id} event={e} subject={e.subjectId ? bySubject.get(e.subjectId) : null} onClick={() => onSelect(e)} dense />
                ))}
                {dayEvents.length > 3 && <p className="px-1.5 t-caption text-ink-3">+{dayEvents.length - 3} more</p>}
                {sessionCount > 0 && <p className="px-1.5 t-caption text-ink-3">{sessionCount} study session{sessionCount === 1 ? "" : "s"}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ anchor, eventsOn, bySubject, onSelect }: ViewProps) {
  const days = eachDayOfInterval({ start: startOfWeek(anchor), end: endOfWeek(anchor) });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayEvents = eventsOn(day);
        return (
          <div key={day.toISOString()} className="rounded-xl border border-border bg-surface p-2.5">
            <div className={cn("mb-2 flex items-center gap-1.5 t-caption font-medium", isToday(day) ? "text-[var(--color-signal-2)]" : "text-ink-2")}>
              {format(day, "EEE d")}
            </div>
            <div className="space-y-1">
              {dayEvents.length === 0 && <p className="t-caption text-ink-3">—</p>}
              {dayEvents.map((e) => (
                <EventChip key={e.id} event={e} subject={e.subjectId ? bySubject.get(e.subjectId) : null} onClick={() => onSelect(e)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ anchor, eventsOn, bySubject, onSelect }: ViewProps) {
  const dayEvents = eventsOn(anchor);
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      {dayEvents.length === 0 ? (
        <p className="py-8 text-center t-callout text-ink-3">Nothing scheduled for this day.</p>
      ) : (
        <ul className="divide-y divide-border">
          {dayEvents.map((e) => (
            <li key={e.id} className="py-2.5 first:pt-0 last:pb-0">
              <EventChip event={e} subject={e.subjectId ? bySubject.get(e.subjectId) : null} onClick={() => onSelect(e)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
