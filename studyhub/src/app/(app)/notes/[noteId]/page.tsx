"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pin, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { RichTextEditor } from "@/components/notes/rich-text-editor";
import { NoteAIPanel } from "@/components/notes/note-ai-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RemoveChipButton } from "@/components/shared/remove-chip-button";

export default function NoteDetailPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const notes = useStudyStore((s) => s.notes);
  const subjects = useStudyStore((s) => s.subjects);
  const updateNote = useStudyStore((s) => s.updateNote);
  const deleteNote = useStudyStore((s) => s.deleteNote);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");
  const contentTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const note = notes.find((n) => n.id === params.noteId);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Note not found</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/notes">
            <ArrowLeft className="size-3.5" /> Back to notes
          </Link>
        </Button>
      </div>
    );
  }

  function handleContentChange(html: string) {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => updateNote(note!.id, { contentHTML: html }), 400);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100dvh - 9.5rem)" }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Button variant="ghost" size="icon-sm" className="mt-1.5 shrink-0" asChild>
            <Link href="/notes">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <Input
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
              placeholder="Untitled note"
              className="h-auto border-none bg-transparent px-0 t-title font-semibold tracking-tight text-ink placeholder:text-ink-3 focus-visible:ring-0"
            />
            <p className="t-caption text-ink-3">Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => updateNote(note.id, { pinned: !note.pinned })}>
            <Pin className={note.pinned ? "size-4 fill-warning text-warning" : "size-4"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={note.subjectId ?? "none"} onValueChange={(v) => updateNote(note.id, { subjectId: v === "none" ? null : v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="No subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No subject</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {note.tags.map((t) => (
          <Badge key={t} variant="outline" className="gap-1">
            #{t}
            <RemoveChipButton label={t} onClick={() => updateNote(note.id, { tags: note.tags.filter((x) => x !== t) })} />
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              updateNote(note.id, { tags: [...note.tags, tagInput.trim().toLowerCase()] });
              setTagInput("");
            }
          }}
          placeholder="+ add tag"
          className="h-6 w-24 border-none bg-transparent px-1 t-caption"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border lg:flex-row" style={{ minHeight: "600px" }}>
        <div className="flex-1 overflow-hidden border-b border-border bg-surface lg:border-b-0 lg:border-r">
          <RichTextEditor content={note.contentHTML} onChange={handleContentChange} className="h-full" />
        </div>
        <div className="w-full shrink-0 bg-[var(--chrome)] lg:w-[380px]">
          <NoteAIPanel note={note} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${note.title || "Untitled note"}"?`}
        description="This can't be undone."
        onConfirm={() => {
          deleteNote(note.id);
          toast.success("Note deleted");
          router.push("/notes");
        }}
      />
    </div>
  );
}
