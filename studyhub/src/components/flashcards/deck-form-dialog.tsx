"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiFlashcards, AIClientError } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function DeckFormDialog({
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
      <DialogContent>
        {/* Mounted only while open, so the form resets itself each time. */}
        <DeckFormBody defaultSubjectId={defaultSubjectId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DeckFormBody({ defaultSubjectId, onClose }: { defaultSubjectId?: string; onClose: () => void }) {
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const documents = useStudyStore((s) => s.documents);
  const addDeck = useStudyStore((s) => s.addDeck);
  const addFlashcard = useStudyStore((s) => s.addFlashcard);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subjectId, setSubjectId] = React.useState(defaultSubjectId ?? subjects[0]?.id ?? "");
  const [documentId, setDocumentId] = React.useState<string>("");
  const [topic, setTopic] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [count, setCount] = React.useState("10");
  const [generating, setGenerating] = React.useState(false);

  const subjectDocs = documents.filter((d) => d.subjectId === subjectId);

  function createManual() {
    if (!name.trim()) return;
    const deck = addDeck({ subjectId: subjectId || null, name: name.trim(), description: description.trim() });
    toast.success(`${deck.name} created`);
    onClose();
    router.push(`/flashcards/${deck.id}`);
  }

  async function generate() {
    const doc = documents.find((d) => d.id === documentId);
    const content = doc ? doc.content : `${topic}. ${detail}`;
    const sourceName = doc ? doc.name : topic;
    if (!sourceName.trim()) return;
    setGenerating(true);
    try {
      const { data } = await aiFlashcards(content, sourceName, Number(count));
      const deck = addDeck({
        subjectId: subjectId || null,
        name: name.trim() || `${sourceName} — flashcards`,
        description: doc ? `Generated from ${doc.name}` : `Generated for "${topic}"`,
        sourceDocumentId: doc?.id,
      });
      data.cards.forEach((c) => addFlashcard({ deckId: deck.id, front: c.front, back: c.back }));
      spendAICredits(3);
      toast.success(`Generated ${data.cards.length} flashcards`);
      onClose();
      router.push(`/flashcards/${deck.id}`);
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Couldn't generate flashcards. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>New flashcard deck</DialogTitle>
        <DialogDescription>Create cards yourself, or let AI generate a first draft.</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Create manually</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="size-3.5" /> Generate with AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Deck name</Label>
              <Input autoFocus placeholder="e.g. Cell biology basics" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="What's this deck for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="No subject" />
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
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={createManual} disabled={!name.trim()}>
                Create deck
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setDocumentId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
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

            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={documentId || "topic"} onValueChange={(v) => setDocumentId(v === "topic" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic">A topic I describe</SelectItem>
                  {subjectDocs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!documentId && (
              <>
                <div className="space-y-1.5">
                  <Label>Topic</Label>
                  <Input placeholder="e.g. Photosynthesis" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Details (optional)</Label>
                  <Textarea rows={3} placeholder="Paste notes or describe what to cover for better cards…" value={detail} onChange={(e) => setDetail(e.target.value)} />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label>Number of cards</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "15", "20"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} cards
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={generate} disabled={generating || (!documentId && !topic.trim())}>
                {generating && <Loader2 className="size-3.5 animate-spin" />} Generate deck
              </Button>
            </DialogFooter>
        </TabsContent>
      </Tabs>
    </>
  );
}
