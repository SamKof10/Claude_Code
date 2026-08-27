"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStudyStore } from "@/lib/store";
import type { Subject, SubjectColor } from "@/lib/types";
import { SUBJECT_ICON_NAMES, getSubjectIcon, subjectColorVar } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const COLORS: SubjectColor[] = ["subj-1", "subj-2", "subj-3", "subj-4", "subj-5", "subj-6", "subj-7", "subj-8"];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so the form resets itself each time. */}
        <SubjectFormBody subject={subject} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SubjectFormBody({ subject, onClose }: { subject?: Subject; onClose: () => void }) {
  const router = useRouter();
  const addSubject = useStudyStore((s) => s.addSubject);
  const updateSubject = useStudyStore((s) => s.updateSubject);

  const [name, setName] = React.useState(subject?.name ?? "");
  const [icon, setIcon] = React.useState(() => subject?.icon ?? pick(SUBJECT_ICON_NAMES));
  const [color, setColor] = React.useState<SubjectColor>(() => subject?.color ?? pick(COLORS));

  function submit() {
    if (!name.trim()) return;
    if (subject) {
      updateSubject(subject.id, { name: name.trim(), icon, color });
      toast.success("Subject updated");
      onClose();
    } else {
      const created = addSubject({ name: name.trim(), icon, color });
      toast.success(`${created.name} added`);
      onClose();
      router.push(`/subjects/${created.id}`);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{subject ? "Edit subject" : "New subject"}</DialogTitle>
        <DialogDescription>Give it a name, an icon and an accent color.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="subject-name">Name</Label>
          <Input
            id="subject-name"
            autoFocus
            placeholder="e.g. Chemistry"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn("size-7 rounded-full ring-offset-2 ring-offset-[var(--surface-overlay)] transition-all", color === c && "ring-2 ring-[var(--color-signal)]")}
                style={{ background: subjectColorVar(c) }}
                aria-label={`Accent color ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Icon</Label>
          <div className="grid grid-cols-8 gap-1.5">
            {SUBJECT_ICON_NAMES.map((iconName) => {
              const Icon = getSubjectIcon(iconName);
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  aria-label={iconName}
                  aria-pressed={icon === iconName}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border transition-colors",
                    icon === iconName
                      ? "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_12%,transparent)] text-[var(--color-signal-2)]"
                      : "border-border bg-surface-2 text-ink-3 hover:text-ink"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!name.trim()}>
          {subject ? "Save changes" : "Create subject"}
        </Button>
      </DialogFooter>
    </>
  );
}
