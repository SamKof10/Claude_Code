"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Layers3, Plus } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { confidence, isDue } from "@/lib/srs";
import type { FlashcardDeck } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DeckCard } from "@/components/flashcards/deck-card";
import { DeckFormDialog } from "@/components/flashcards/deck-form-dialog";
import { Button } from "@/components/ui/button";

export default function FlashcardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const decks = useStudyStore((s) => s.decks);
  const flashcards = useStudyStore((s) => s.flashcards);
  const deleteDeck = useStudyStore((s) => s.deleteDeck);

  const [formOpen, setFormOpen] = React.useState(searchParams.get("new") === "1");
  const [pendingDelete, setPendingDelete] = React.useState<FlashcardDeck | null>(null);
  const bySubject = new Map(subjects.map((s) => [s.id, s]));

  React.useEffect(() => {
    if (searchParams.get("study") === "1" && decks.length > 0) {
      const withDue = decks
        .map((d) => ({ d, due: flashcards.filter((c) => c.deckId === d.id && isDue(c)).length }))
        .sort((a, b) => b.due - a.due)[0];
      if (withDue) router.replace(`/flashcards/${withDue.d.id}/study`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div>
      <PageHeader
        title="Flashcards"
        description="Spaced repetition that adapts to what you actually know."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-3.5" /> New deck
          </Button>
        }
      />

      {decks.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="No decks yet"
          description="Create a deck by hand, or generate one instantly from a document or topic with AI."
          action={<Button onClick={() => setFormOpen(true)}>Create your first deck</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => {
            const cards = flashcards.filter((c) => c.deckId === deck.id);
            const dueCount = cards.filter((c) => isDue(c)).length;
            const reviewed = cards.filter((c) => c.correctCount + c.incorrectCount > 0);
            const masteredPct = reviewed.length ? Math.round(reviewed.reduce((a, c) => a + confidence(c), 0) / reviewed.length) : 0;
            return (
              <DeckCard
                key={deck.id}
                deck={deck}
                subject={deck.subjectId ? bySubject.get(deck.subjectId) : null}
                cardCount={cards.length}
                dueCount={dueCount}
                masteredPct={masteredPct}
                onDelete={() => setPendingDelete(deck)}
              />
            );
          })}
        </div>
      )}

      <DeckFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
          title={`Delete "${pendingDelete.name}"?`}
          description="This deletes all of its cards too. This can't be undone."
          onConfirm={() => {
            deleteDeck(pendingDelete.id);
            toast.success("Deck deleted");
          }}
        />
      )}
    </div>
  );
}
