"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Upload, X } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { DocumentFileType } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function inferFileType(file: File): DocumentFileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) return "image";
  return "text";
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubjectId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Mounted only while open, so the form resets itself each time. */}
        <UploadFormBody defaultSubjectId={defaultSubjectId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function UploadFormBody({ defaultSubjectId, onClose }: { defaultSubjectId?: string; onClose: () => void }) {
  const subjects = useStudyStore((s) => s.subjects);
  const addDocument = useStudyStore((s) => s.addDocument);

  const [files, setFiles] = React.useState<File[]>([]);
  const [subjectId, setSubjectId] = React.useState(defaultSubjectId ?? subjects[0]?.id ?? "");
  const [pastedContent, setPastedContent] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function submit() {
    if (files.length === 0 || !subjectId) return;
    for (const file of files) {
      const fileType = inferFileType(file);
      let content = files.length === 1 ? pastedContent.trim() : "";
      if (!content && fileType === "text") {
        try {
          content = await file.text();
        } catch {
          content = "";
        }
      }
      if (!content) {
        content = `"${file.name}" was uploaded in demo mode without extracted text. Paste the document's text next time to unlock full AI features (summaries, flashcards, quizzes) grounded in its real content.`;
      }
      addDocument({
        subjectId,
        name: file.name,
        fileType,
        sizeBytes: file.size,
        pages: fileType === "pdf" ? Math.max(1, Math.round(file.size / 45000)) : null,
        tags: [],
        content,
      });
    }
    toast.success(files.length === 1 ? `${files[0].name} uploaded` : `${files.length} documents uploaded`);
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Dokument hochladen</DialogTitle>
        <DialogDescription>PDF, Word, images or text files. StudyHub processes them for AI features automatically.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_8%,transparent)]"
              : "border-border-strong bg-surface-2 hover:bg-surface-hover"
          }`}
        >
          <Upload className="size-5 text-ink-3" />
          <p className="t-callout font-medium text-ink">Drop files here, or click to browse</p>
          <p className="t-caption text-ink-3">PDF, DOCX, PNG/JPG, TXT</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md"
          />
        </button>

        {files.length > 0 && (
          <ul className="space-y-1.5">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 t-callout">
                <FileText className="size-4 shrink-0 text-ink-3" />
                <span className="min-w-0 flex-1 truncate text-ink">{f.name}</span>
                <span className="shrink-0 text-ink-3">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-ink-3 hover:text-danger-text"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-1.5">
          <Label>Fach</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Fach wählen" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {files.length === 1 && (
          <div className="space-y-1.5">
            <Label>Dokumenttext (optional)</Label>
            <Textarea
              rows={4}
              placeholder="Füg den Text des Dokuments ein — davon leben Zusammenfassungen, Karteikarten und Quiz im Demo-Modus…"
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={files.length === 0 || !subjectId}>
          Upload {files.length > 0 ? `(${files.length})` : ""}
        </Button>
      </DialogFooter>
    </>
  );
}
