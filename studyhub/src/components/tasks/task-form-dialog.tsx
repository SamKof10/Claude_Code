"use client";

import * as React from "react";
import { useStudyStore } from "@/lib/store";
import type { RecurringFrequency, StudyTask, TaskPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: StudyTask;
  defaultSubjectId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so the form resets itself each time. */}
        <TaskFormBody task={task} defaultSubjectId={defaultSubjectId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TaskFormBody({ task, defaultSubjectId, onClose }: { task?: StudyTask; defaultSubjectId?: string; onClose: () => void }) {
  const subjects = useStudyStore((s) => s.subjects);
  const addTask = useStudyStore((s) => s.addTask);
  const updateTask = useStudyStore((s) => s.updateTask);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [subjectId, setSubjectId] = React.useState<string>(task?.subjectId ?? defaultSubjectId ?? "none");
  const [deadline, setDeadline] = React.useState(() => toLocalInput(task?.deadline ?? null));
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority ?? "medium");
  const [estimated, setEstimated] = React.useState(String(task?.estimatedMinutes ?? 30));
  const [recurring, setRecurring] = React.useState<string>(task?.recurring ?? "none");

  function submit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      subjectId: subjectId === "none" ? null : subjectId,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      estimatedMinutes: estimated ? Number(estimated) : null,
      recurring: recurring === "none" ? null : (recurring as RecurringFrequency),
    };
    if (task) updateTask(task.id, payload);
    else addTask({ ...payload, status: "todo" });
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{task ? "Aufgabe bearbeiten" : "Neue Aufgabe"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Titel</Label>
          <Input autoFocus placeholder="Was ist zu tun?" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Beschreibung</Label>
          <Textarea rows={2} placeholder="Optionale Details" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Fach</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Fach</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priorität</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Frist</Label>
            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Dauer ca. (Min)</Label>
            <Input type="number" min={5} step={5} value={estimated} onChange={(e) => setEstimated(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Wiederholung</Label>
          <Select value={recurring} onValueChange={setRecurring}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Wiederholt sich nicht</SelectItem>
              <SelectItem value="daily">Täglich</SelectItem>
              <SelectItem value="weekly">Wöchentlich</SelectItem>
              <SelectItem value="monthly">Monatlich</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={submit} disabled={!title.trim()}>
          {task ? "Änderungen speichern" : "Aufgabe anlegen"}
        </Button>
      </DialogFooter>
    </>
  );
}
