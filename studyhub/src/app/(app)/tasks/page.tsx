"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckSquare, Plus } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { overdueTasks } from "@/lib/analytics";
import type { StudyTask, TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "Offen" },
  { status: "in-progress", label: "In Arbeit" },
  { status: "done", label: "Erledigt" },
];

export default function TasksPage() {
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const tasks = useStudyStore((s) => s.tasks);
  const setTaskStatus = useStudyStore((s) => s.setTaskStatus);
  const deleteTask = useStudyStore((s) => s.deleteTask);

  const [formState, setFormState] = React.useState<{ open: boolean; task?: StudyTask }>({ open: searchParams.get("new") === "1" });
  const [pendingDelete, setPendingDelete] = React.useState<StudyTask | null>(null);
  const [subjectFilter, setSubjectFilter] = React.useState("all");
  const [dragOverCol, setDragOverCol] = React.useState<TaskStatus | null>(null);

  const bySubject = new Map(subjects.map((s) => [s.id, s]));
  const filtered = tasks.filter((t) => subjectFilter === "all" || t.subjectId === subjectFilter);
  const overdue = overdueTasks(tasks);

  function moveTask(id: string, status: TaskStatus) {
    setTaskStatus(id, status);
  }

  return (
    <div>
      <PageHeader
        title="Aufgaben"
        description="Hausaufgaben und To-dos, nach Status sortiert."
        actions={
          <Button onClick={() => setFormState({ open: true })}>
            <Plus className="size-3.5" /> Neue Aufgabe
          </Button>
        }
      />

      {tasks.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Alle Fächer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Fächer</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {overdue.length > 0 && (
            <Badge variant="danger" className="gap-1">
              {overdue.length} overdue
            </Badge>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Noch keine Aufgaben"
          description="Trag Hausaufgaben, Abgaben und To-dos ein — überfällige werden in der Übersicht automatisch hervorgehoben."
          action={<Button onClick={() => setFormState({ open: true })}>Erste Aufgabe anlegen</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = filtered.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.status);
                }}
                onDragLeave={() => setDragOverCol((c) => (c === col.status ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/task-id");
                  if (id) moveTask(id, col.status);
                  setDragOverCol(null);
                }}
                className={cn("rounded-2xl border border-border bg-[var(--chrome)] p-3 transition-colors", dragOverCol === col.status && "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_6%,transparent)]")}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="t-callout font-semibold text-ink">{col.label}</h2>
                  <span className="t-caption text-ink-3">{items.length}</span>
                </div>
                <div className="space-y-2.5 min-h-16">
                  {items.map((task) => (
                    <div key={task.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}>
                      <TaskCard
                        task={task}
                        subject={task.subjectId ? bySubject.get(task.subjectId) : null}
                        onEdit={() => setFormState({ open: true, task })}
                        onDelete={() => setPendingDelete(task)}
                        onToggleDone={() => setTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                      />
                    </div>
                  ))}
                  {items.length === 0 && <p className="px-1 py-4 text-center t-caption text-ink-3">Nichts hier</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormDialog open={formState.open} onOpenChange={(open) => setFormState({ open })} task={formState.task} defaultSubjectId={subjectFilter !== "all" ? subjectFilter : undefined} />

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`„${pendingDelete.title}“ löschen?`}
          description="Das lässt sich nicht rückgängig machen."
          onConfirm={() => {
            deleteTask(pendingDelete.id);
            toast.success("Aufgabe gelöscht");
          }}
        />
      )}
    </div>
  );
}
