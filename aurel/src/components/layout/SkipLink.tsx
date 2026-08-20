"use client";

import { useT } from "@/lib/i18n";

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#inhalt"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
    >
      {t.common.skipToContent}
    </a>
  );
}
