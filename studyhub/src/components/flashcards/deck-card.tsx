"use client";

import Link from "next/link";
import { Layers3, MoreHorizontal, Play, Trash2 } from "lucide-react";
import type { FlashcardDeck, Subject } from "@/lib/types";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DeckCard({
  deck,
  subject,
  cardCount,
  dueCount,
  masteredPct,
  onDelete,
}: {
  deck: FlashcardDeck;
  subject: Subject | null | undefined;
  cardCount: number;
  dueCount: number;
  masteredPct: number;
  onDelete: () => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete deck
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/flashcards/${deck.id}`} className="block">
        <div className="flex items-center gap-2.5 pr-8">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
            <Layers3 className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate t-body font-semibold text-ink">{deck.name}</h3>
            <p className="t-caption text-ink-3">{cardCount} card{cardCount === 1 ? "" : "s"}</p>
          </div>
        </div>
        {deck.description && <p className="mt-2.5 line-clamp-2 t-callout text-ink-3">{deck.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {subject && <SubjectPill subject={subject} />}
          <Badge variant="outline">{masteredPct}% mastered</Badge>
          {dueCount > 0 && <Badge variant="warning">{dueCount} due</Badge>}
        </div>
      </Link>

      <Button size="sm" variant="secondary" className="mt-3 w-full" disabled={cardCount === 0} asChild>
        <Link href={`/flashcards/${deck.id}/study`}>
          <Play className="size-3.5" /> Study
        </Link>
      </Button>
    </div>
  );
}
