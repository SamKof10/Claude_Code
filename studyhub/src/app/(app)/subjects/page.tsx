"use client";

import * as React from "react";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStudyStore } from "@/lib/store";
import { subjectLastActivity, subjectPerformances, subjectWeakTopics } from "@/lib/analytics";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const state = useStudyStore();
  const deleteSubject = useStudyStore((s) => s.deleteSubject);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = React.useState<Subject | null>(null);

  const perf = subjectPerformances(state);

  return (
    <div>
      <PageHeader
        title="Fächer"
        description="Jedes Fach bekommt seinen eigenen Bereich — Dokumente, Notizen, Karteikarten, Quiz und Fortschritt."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Neues Fach
          </Button>
        }
      />

      {perf.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Noch keine Fächer"
          description="Leg dein erstes Fach an, um Dokumente, Notizen und Lernpläne zu ordnen."
          action={<Button onClick={() => setFormOpen(true)}>Erstes Fach anlegen</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {perf.map((p) => (
            <SubjectCard
              key={p.subject.id}
              perf={p}
              weakTopics={subjectWeakTopics(state, p.subject.id)}
              lastActivity={subjectLastActivity(state, p.subject.id)}
              onEdit={() => {
                setEditing(p.subject);
                setFormOpen(true);
              }}
              onDelete={() => setPendingDelete(p.subject)}
            />
          ))}
        </div>
      )}

      <SubjectFormDialog open={formOpen} onOpenChange={setFormOpen} subject={editing} />

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`${pendingDelete.name} löschen?`}
          description="Das Fach wird entfernt. Seine Dokumente, Stapel und Prüfungen verschwinden mit; Notizen und Aufgaben bleiben, aber ohne Fach."
          onConfirm={() => {
            deleteSubject(pendingDelete.id);
            toast.success(`${pendingDelete.name} gelöscht`);
          }}
        />
      )}
    </div>
  );
}
