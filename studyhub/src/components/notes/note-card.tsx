"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pin, Trash2 } from "lucide-react";
import type { Note, Subject } from "@/lib/types";
import { htmlToText } from "@/lib/html-to-text";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NoteCard({
  note,
  subject,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  subject: Subject | null | undefined;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const snippet = htmlToText(note.contentHTML).slice(0, 140);

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onTogglePin} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-warning">
          <Pin className={note.pinned ? "size-3.5 fill-warning text-warning" : "size-3.5"} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/notes/${note.id}`} className="block">
        <div className="flex items-center gap-1.5 pr-10">
          {note.pinned && <Pin className="size-3 shrink-0 fill-warning text-warning" />}
          <h3 className="truncate text-[14px] font-semibold text-ink">{note.title || "Untitled note"}</h3>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink-3">{snippet || "No content yet."}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          {note.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline">
              #{t}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-3">Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</p>
      </Link>
    </div>
  );
}
