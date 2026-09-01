"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { confidence, isDue } from "@/lib/srs";
import { aiFlashcards, AIClientError } from "@/lib/ai/client";
import type { Flashcard } from "@/lib/types";
import { formatDateShort } from "@/lib/date-format";
import { SubjectPill } from "@/components/shared/subject-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CardFormDialog } from "@/components/flashcards/card-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const decks = useStudyStore((s) => s.decks);
  const flashcards = useStudyStore((s) => s.flashcards);
  const addFlashcard = useStudyStore((s) => s.addFlashcard);
  const updateFlashcard = useStudyStore((s) => s.updateFlashcard);
  const deleteFlashcard = useStudyStore((s) => s.deleteFlashcard);
  const deleteDeck = useStudyStore((s) => s.deleteDeck);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);

  const [cardDialog, setCardDialog] = React.useState<{ open: boolean; card?: Flashcard }>({ open: false });
  const [confirmDeleteCard, setConfirmDeleteCard] = React.useState<Flashcard | null>(null);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const deck = decks.find((d) => d.id === params.deckId);
  const cards = flashcards.filter((c) => c.deckId === params.deckId);
  const subject = deck?.subjectId ? subjects.find((s) => s.id === deck.subjectId) : null;

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Stapel nicht gefunden</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/flashcards">
            <ArrowLeft className="size-3.5" /> Zurück zu den Karteikarten
          </Link>
        </Button>
      </div>
    );
  }

  async function generateMore() {
    setGenerating(true);
    try {
      const seed = cards.map((c) => `${c.front} ${c.back}`).join(". ") || deck!.description || deck!.name;
      const { data } = await aiFlashcards(seed, deck!.name, 5);
      data.cards.forEach((c) => addFlashcard({ deckId: deck!.id, front: c.front, back: c.back }));
      spendAICredits(3);
      toast.success(`${data.cards.length} Karten hinzugefügt`);
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Karten konnten nicht erzeugt werden. Versuch es nochmal.");
    } finally {
      setGenerating(false);
    }
  }

  const dueCount = cards.filter((c) => isDue(c)).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Button variant="ghost" size="icon-sm" className="mt-0.5 shrink-0" asChild>
            <Link href="/flashcards">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="t-title-2 font-semibold tracking-tight text-ink">{deck.name}</h1>
            <p className="mt-0.5 t-callout text-ink-3">{deck.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {subject && <SubjectPill subject={subject} />}
              <Badge variant="outline">{cards.length} cards</Badge>
              {dueCount > 0 && <Badge variant="warning">{dueCount} due</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteDeck(true)}>
            <Trash2 className="size-4" />
          </Button>
          <Button variant="secondary" onClick={generateMore} disabled={generating}>
            {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Mehr erzeugen
          </Button>
          <Button variant="secondary" onClick={() => setCardDialog({ open: true })}>
            <Plus className="size-3.5" /> Karte hinzufügen
          </Button>
          <Button disabled={cards.length === 0} asChild>
            <Link href={`/flashcards/${deck.id}/study`}>
              <Play className="size-3.5" /> Lernen
            </Link>
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Noch keine Karten"
          description="Leg eine Karte selbst an — oder lass die KI einen ersten Satz erzeugen."
          action={<Button onClick={() => setCardDialog({ open: true })}>Erste Karte anlegen</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <div key={card.id} className="group rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="t-body font-medium text-ink">{card.front}</p>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setCardDialog({ open: true, card })} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:outline-none">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => setConfirmDeleteCard(card)} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-danger-text focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:outline-none">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-1.5 t-callout text-ink-3">{card.back}</p>
              <div className="mt-3 flex items-center gap-2">
                <Progress value={confidence(card)} className="h-1 flex-1" />
                <span className="shrink-0 t-caption text-ink-3">{confidence(card)}%</span>
              </div>
              <p className="mt-1.5 t-caption text-ink-3">
                {card.lastReviewed ? `Wiederholt · nächste ${formatDateShort(card.nextReview)}` : "Noch nicht wiederholt"}
              </p>
            </div>
          ))}
        </div>
      )}

      <CardFormDialog
        open={cardDialog.open}
        onOpenChange={(open) => setCardDialog({ open })}
        initialFront={cardDialog.card?.front}
        initialBack={cardDialog.card?.back}
        onSubmit={(front, back) => {
          if (cardDialog.card) updateFlashcard(cardDialog.card.id, { front, back });
          else addFlashcard({ deckId: deck.id, front, back });
        }}
      />

      {confirmDeleteCard && (
        <ConfirmDialog
          open={!!confirmDeleteCard}
          onOpenChange={(o) => !o && setConfirmDeleteCard(null)}
          title="Diese Karte löschen?"
          description="Das lässt sich nicht rückgängig machen."
          onConfirm={() => {
            deleteFlashcard(confirmDeleteCard.id);
            toast.success("Karte gelöscht");
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteDeck}
        onOpenChange={setConfirmDeleteDeck}
        title={`„${deck.name}“ löschen?`}
        description="Damit verschwinden auch alle Karten darin. Das lässt sich nicht rückgängig machen."
        onConfirm={() => {
          deleteDeck(deck.id);
          toast.success("Stapel gelöscht");
          router.push("/flashcards");
        }}
      />
    </div>
  );
}
