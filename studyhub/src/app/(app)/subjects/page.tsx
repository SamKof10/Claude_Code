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
        title="Subjects"
        description="Every subject gets its own workspace — documents, notes, flashcards, quizzes and progress."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" /> New subject
          </Button>
        }
      />

      {perf.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subjects yet"
          description="Add your first subject to start organizing documents, notes and study plans."
          action={<Button onClick={() => setFormOpen(true)}>Add your first subject</Button>}
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
          title={`Delete ${pendingDelete.name}?`}
          description="This removes the subject. Its documents, decks and exams are deleted too; notes and tasks are kept but unassigned."
          onConfirm={() => {
            deleteSubject(pendingDelete.id);
            toast.success(`${pendingDelete.name} deleted`);
          }}
        />
      )}
    </div>
  );
}
