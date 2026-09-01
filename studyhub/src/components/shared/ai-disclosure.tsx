"use client";

import * as React from "react";
import { Info, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AISource } from "@/lib/ai/service";

/**
 * The three disclosures HIG Generative AI asks for, in one place so every
 * AI surface says the same thing.
 *
 *  • Where AI is used, and whether it's a real model or the demo generator
 *    ("Communicate where your app uses AI… never trick someone into thinking
 *    they're… viewing content authored by a human").
 *  • That output can be wrong ("it's important to clearly communicate that
 *    AI-generated content may contain errors").
 *  • Whether their material leaves the device ("Make sure people know if
 *    their information may be sent to a server").
 */

/** Badge naming which engine produced a result, with the caveat behind it. */
export function AISourceBadge({ source, className }: { source?: AISource; className?: string }) {
  if (!source) return null;
  const live = source === "live";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex", className)}>
          <Badge variant={live ? "signal" : "outline"} className="cursor-help gap-1">
            <Sparkles className="size-2.5" />
            {live ? "Echte KI" : "Demo-KI"}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        {live
          ? "Von einem echten Sprachmodell erzeugt. Es kann überzeugend danebenliegen — prüf alles, wofür du benotet wirst."
          : "Auf dem Gerät erzeugt, von StudyHubs eingebautem Demo-Generator aus deinem eigenen Material. Es ist kein API-Schlüssel hinterlegt, also lief kein echtes Modell und nichts hat diesen Browser verlassen."}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The standing "check this" line. Deliberately quiet and placed near the
 * output rather than as an interrupting alert — HIG warns that alerts "lose
 * their impact if you use them too often."
 */
export function AIErrorCaveat({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 t-caption text-ink-3", className)}>
      <Info className="mt-px size-3 shrink-0" />
      <span>KI kann sich irren. Prüf alles nach, wofür du benotet wirst.</span>
    </p>
  );
}

/**
 * Thumbs up/down on a single output. HIG: "offer a quick and easy way to give
 * positive and negative feedback… Always make providing feedback voluntary."
 * Feedback is kept local — there is no backend to send it to yet, and saying
 * so is more honest than implying it was filed somewhere.
 */
export function AIFeedback({ className }: { className?: string }) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);

  function cast(next: "up" | "down") {
    const value = vote === next ? null : next;
    setVote(value);
    if (value === "down") {
      toast("Danke — für diese Sitzung notiert.", {
        description: "Formulier die Frage um oder stell den Tutor auf Vereinfachen oder Sokratisch für einen anderen Blickwinkel.",
      });
    } else if (value === "up") {
      toast.success("Danke — für diese Sitzung notiert.");
    }
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {(["up", "down"] as const).map((dir) => {
        const Icon = dir === "up" ? ThumbsUp : ThumbsDown;
        const active = vote === dir;
        return (
          <button
            key={dir}
            type="button"
            onClick={() => cast(dir)}
            aria-pressed={active}
            aria-label={dir === "up" ? "Diese Antwort war hilfreich" : "Diese Antwort war nicht hilfreich"}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]",
              active
                ? dir === "up"
                  ? "text-success-text"
                  : "text-danger-text"
                : "text-ink-3 hover:bg-surface-2 hover:text-ink"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Shown where a person is about to send their own material to a model —
 * the document and note AI panels, and the tutor when a document is attached.
 */
export function AIDataNotice({ live, what, className }: { live: boolean; what: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 t-caption text-ink-3", className)}>
      <Info className="mt-px size-3 shrink-0" />
      <span>
        {live
          ? `${what} wird zum Beantworten an StudyHubs KI-Anbieter geschickt. Nimm nichts hinein, was du nicht teilen würdest.`
          : `${what} bleibt in diesem Browser — der Demo-Modus läuft vollständig auf dem Gerät.`}
      </span>
    </p>
  );
}

/** Reads /api/ai once to find out whether a real model is wired up. */
export function useAILiveStatus() {
  const [live, setLive] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setLive(Boolean(d.liveConfigured));
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return live;
}
