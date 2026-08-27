import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center dot-grid">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-2">
        <Compass className="size-5 text-ink-3" />
      </div>
      <h1 className="t-title-2 font-semibold text-ink">Page not found</h1>
      <p className="mt-1.5 max-w-sm t-callout text-ink-3">That page doesn&apos;t exist in StudyHub. It may have been deleted, or the link is out of date.</p>
      <Button className="mt-5" asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
