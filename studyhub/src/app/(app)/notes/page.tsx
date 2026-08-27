"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { NotebookPen, Plus, Search } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { Note } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { NoteCard } from "@/components/notes/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const notes = useStudyStore((s) => s.notes);
  const addNote = useStudyStore((s) => s.addNote);
  const updateNote = useStudyStore((s) => s.updateNote);
  const deleteNote = useStudyStore((s) => s.deleteNote);

  const [query, setQuery] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState(searchParams.get("subject") ?? "all");
  const [pendingDelete, setPendingDelete] = React.useState<Note | null>(null);
  const createdRef = React.useRef(false);

  React.useEffect(() => {
    if (searchParams.get("new") === "1" && !createdRef.current) {
      createdRef.current = true;
      const created = addNote({ title: "Untitled note", subjectId: subjectFilter !== "all" ? subjectFilter : null });
      router.replace(`/notes/${created.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const bySubject = new Map(subjects.map((s) => [s.id, s]));
  const filtered = notes.filter((n) => {
    if (subjectFilter !== "all" && n.subjectId !== subjectFilter) return false;
    if (query && !`${n.title} ${n.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Write, organize and let AI help you fill the gaps."
        actions={
          <Button onClick={() => router.push(`/notes/${addNote({ title: "Untitled note", subjectId: subjectFilter !== "all" ? subjectFilter : null }).id}`)}>
            <Plus className="size-3.5" /> New note
          </Button>
        }
      />

      {notes.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Capture what you're learning — headings, lists, math, links — and let AI turn it into flashcards or a quiz."
          action={<Button onClick={() => router.push(`/notes/${addNote({ title: "Untitled note", subjectId: null }).id}`)}>Write your first note</Button>}
        />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Search} title="No matching notes" description="Try a different search term or subject filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              subject={note.subjectId ? bySubject.get(note.subjectId) : null}
              onTogglePin={() => updateNote(note.id, { pinned: !note.pinned })}
              onDelete={() => setPendingDelete(note)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`Delete "${pendingDelete.title || "Untitled note"}"?`}
          description="This can't be undone."
          onConfirm={() => {
            deleteNote(pendingDelete.id);
            toast.success("Note deleted");
          }}
        />
      )}
    </div>
  );
}
