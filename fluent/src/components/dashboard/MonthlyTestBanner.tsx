"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useStore, monthlyTestStatus } from "@/lib/store";

export function MonthlyTestBanner() {
  const { state } = useStore();
  if (!state.hydrated) return null;

  const status = monthlyTestStatus(state);
  if (!status.available) return null;

  return (
    <Reveal>
      <Link
        href="/progress/monthly-test"
        className="border-beam group flex items-center justify-between gap-3 rounded-2xl border border-signal/30 bg-signal/[0.06] px-5 py-3.5 text-[13.5px] font-medium text-ink-1 transition-colors hover:bg-signal/[0.1]"
      >
        <span className="flex items-center gap-2.5">
          <Sparkles size={15} className="text-signal" /> Check-in #{status.monthIndex} is ready — see how far you&rsquo;ve come.
        </span>
        <ArrowRight size={15} className="shrink-0 text-signal transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Reveal>
  );
}
