"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Plus, Search } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import type { StudyDocument } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DocumentCard } from "@/components/documents/document-card";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const documents = useStudyStore((s) => s.documents);
  const updateDocument = useStudyStore((s) => s.updateDocument);
  const deleteDocument = useStudyStore((s) => s.deleteDocument);

  const [query, setQuery] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState(searchParams.get("subject") ?? "all");
  const [uploadOpen, setUploadOpen] = React.useState(searchParams.get("upload") === "1");
  const [pendingDelete, setPendingDelete] = React.useState<StudyDocument | null>(null);

  const bySubject = new Map(subjects.map((s) => [s.id, s]));

  const filtered = documents.filter((d) => {
    if (subjectFilter !== "all" && d.subjectId !== subjectFilter) return false;
    if (query && !`${d.name} ${d.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => Number(b.starred) - Number(a.starred) || +new Date(b.uploadDate) - +new Date(a.uploadDate));

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Every PDF, doc, image and note you've uploaded — with AI ready to explain any of it."
        actions={
          <Button
            onClick={() => {
              setUploadOpen(true);
              router.replace("/documents");
            }}
          >
            <Plus className="size-3.5" /> Upload document
          </Button>
        }
      />

      {documents.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
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

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload a PDF, Word doc, image or text file and StudyHub's AI can summarize it, explain it, or turn it into flashcards and quizzes."
          action={<Button onClick={() => setUploadOpen(true)}>Upload your first document</Button>}
        />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Search} title="No matching documents" description="Try a different search term or subject filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              subject={bySubject.get(doc.subjectId)}
              onToggleStar={() => updateDocument(doc.id, { starred: !doc.starred })}
              onDelete={() => setPendingDelete(doc)}
            />
          ))}
        </div>
      )}

      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} defaultSubjectId={subjectFilter !== "all" ? subjectFilter : undefined} />

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`Delete ${pendingDelete.name}?`}
          description="This can't be undone."
          onConfirm={() => {
            deleteDocument(pendingDelete.id);
            toast.success("Document deleted");
          }}
        />
      )}
    </div>
  );
}
