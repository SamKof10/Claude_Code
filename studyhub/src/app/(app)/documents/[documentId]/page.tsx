"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, File, FileText, FileType, Image as ImageIcon, Loader2, Star, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { formatBytes } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-format";
import { DocumentAIPanel } from "@/components/documents/document-ai-panel";
import { SubjectPill } from "@/components/shared/subject-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RemoveChipButton } from "@/components/shared/remove-chip-button";

const FILE_ICON = { pdf: FileText, docx: FileType, image: ImageIcon, text: File } as const;

export default function DocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const documents = useStudyStore((s) => s.documents);
  const subjects = useStudyStore((s) => s.subjects);
  const updateDocument = useStudyStore((s) => s.updateDocument);
  const deleteDocument = useStudyStore((s) => s.deleteDocument);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");

  const document = documents.find((d) => d.id === params.documentId);
  const subject = subjects.find((s) => s.id === document?.subjectId);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Dokument nicht gefunden</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/documents">
            <ArrowLeft className="size-3.5" /> Zurück zu den Dokumenten
          </Link>
        </Button>
      </div>
    );
  }

  const Icon = FILE_ICON[document.fileType];

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100dvh - 9.5rem)" }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon-sm" className="mt-0.5 shrink-0" asChild>
            <Link href="/documents">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate t-title-2 font-semibold tracking-tight text-ink">{document.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {subject && <SubjectPill subject={subject} href={`/subjects/${subject.id}`} />}
              {document.status === "processing" ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="size-2.5 animate-spin" /> Wird verarbeitet
                </Badge>
              ) : (
                <Badge variant="success">Bereit</Badge>
              )}
              <span className="t-caption text-ink-3">
                {document.pages ? `${document.pages} Seiten · ` : ""}
                {formatBytes(document.sizeBytes)} · {formatDateShort(document.uploadDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => updateDocument(document.id, { starred: !document.starred })}>
            <Star className={document.starred ? "size-4 fill-warning text-warning" : "size-4"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {document.tags.map((t) => (
          <Badge key={t} variant="outline" className="gap-1">
            #{t}
            <RemoveChipButton label={t} onClick={() => updateDocument(document.id, { tags: document.tags.filter((x) => x !== t) })} />
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              updateDocument(document.id, { tags: [...document.tags, tagInput.trim().toLowerCase()] });
              setTagInput("");
            }
          }}
          placeholder="+ Schlagwort"
          className="h-6 w-24 border-none bg-transparent px-1 t-caption"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border lg:flex-row" style={{ minHeight: "600px" }}>
        <div className="flex-1 overflow-y-auto border-b border-border bg-surface p-6 lg:border-b-0 lg:border-r">
          {document.summary && (
            <div className="mb-5 rounded-xl border border-border bg-surface-2 p-3.5">
              <p className="mono-label mb-1.5">KI-Zusammenfassung</p>
              <p className="t-callout text-ink-2">{document.summary}</p>
            </div>
          )}
          <div className="whitespace-pre-wrap font-[450] t-body leading-[1.75] text-ink-2">{document.content}</div>
        </div>
        <div className="w-full shrink-0 bg-[var(--chrome)] lg:w-[400px]">
          <DocumentAIPanel document={document} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`${document.name} löschen?`}
        description="Das lässt sich nicht rückgängig machen."
        onConfirm={() => {
          deleteDocument(document.id);
          toast.success("Dokument gelöscht");
          router.push("/documents");
        }}
      />
    </div>
  );
}
