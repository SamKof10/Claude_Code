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
      <h1 className="t-headline font-semibold text-ink">Something went wrong on this page</h1>
      <p className="mt-1.5 max-w-sm t-callout text-ink-3">
        Your data is safe — it&apos;s stored in this browser. Try reloading the page, or head back to the dashboard.
      </p>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" onClick={reset}>
          <RotateCcw className="size-3.5" /> Try again
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
