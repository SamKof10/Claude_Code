"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]">
        <AlertTriangle className="size-5 text-warning-text" />
      </div>
      <h1 className="t-headline font-semibold text-ink">Auf dieser Seite ist etwas schiefgelaufen</h1>
      <p className="mt-1.5 max-w-sm t-callout text-ink-3">
        Deine Daten sind sicher — sie liegen in diesem Browser. Lade die Seite neu oder geh zurück zur Übersicht.
      </p>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" onClick={reset}>
          <RotateCcw className="size-3.5" /> Nochmal versuchen
        </Button>
        <Button asChild>
          <Link href="/dashboard">Zur Übersicht</Link>
        </Button>
      </div>
    </div>
  );
}
