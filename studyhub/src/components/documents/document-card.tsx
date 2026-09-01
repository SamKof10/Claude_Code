"use client";

import Link from "next/link";
import { File, FileText, FileType, Image as ImageIcon, Loader2, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import type { Subject, StudyDocument } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const FILE_ICON = { pdf: FileText, docx: FileType, image: ImageIcon, text: File } as const;

export function DocumentCard({
  document,
  subject,
  onToggleStar,
  onDelete,
}: {
  document: StudyDocument;
  subject: Subject | null | undefined;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  const Icon = FILE_ICON[document.fileType];

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onToggleStar} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-warning-text">
          <Star className={document.starred ? "size-3.5 fill-warning text-warning" : "size-3.5"} />
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

      <Link href={`/documents/${document.id}`} className="block">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0 flex-1 pr-10">
            <h3 className="truncate t-body font-semibold text-ink">{document.name}</h3>
            <p className="mt-0.5 t-caption text-ink-3">
              {document.pages ? `${document.pages} Seiten · ` : ""}
              {formatBytes(document.sizeBytes)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          {document.status === "processing" ? (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="size-2.5 animate-spin" /> Processing
            </Badge>
          ) : document.status === "error" ? (
            <Badge variant="danger">Fehlgeschlagen</Badge>
          ) : (
            <Badge variant="success">Bereit</Badge>
          )}
        </div>

        {document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {document.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline">
                #{t}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-3 t-caption text-ink-3">Hochgeladen {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true, locale: de })}</p>
      </Link>
    </div>
  );
}
