import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center dot-grid">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-2">
        <Compass className="size-5 text-ink-3" />
      </div>
      <h1 className="t-title-2 font-semibold text-ink">Seite nicht gefunden</h1>
      <p className="mt-1.5 max-w-sm t-callout text-ink-3">Diese Seite gibt es in StudyHub nicht. Vielleicht wurde sie gelöscht, oder der Link ist veraltet.</p>
      <Button className="mt-5" asChild>
        <Link href="/dashboard">Zurück zur Übersicht</Link>
      </Button>
    </div>
  );
}
