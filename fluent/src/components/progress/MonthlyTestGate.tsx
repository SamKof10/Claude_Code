"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useStore, monthlyTestStatus } from "@/lib/store";
import { MonthlyTestRunner } from "./MonthlyTestRunner";

export function MonthlyTestGate() {
  const { state } = useStore();
  // Frozen once, the moment a check-in is found available — otherwise
  // completing it (which updates `monthlyTests` and immediately makes the
  // *next* one unavailable) would unmount the runner mid-results-screen.
  const [lockedMonthIndex, setLockedMonthIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!state.hydrated || lockedMonthIndex !== null) return;
    const status = monthlyTestStatus(state);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time gate decision, frozen for this page visit
    if (status.available) setLockedMonthIndex(status.monthIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated]);

  if (!state.hydrated) return null;

  if (lockedMonthIndex === null) {
    const status = monthlyTestStatus(state);
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-ink-3">
          <Lock size={20} />
        </span>
        <h1 className="display mt-5 text-[26px] text-ink-1">Not due yet</h1>
        <p className="lede mt-2">
          Check-in #{status.monthIndex} unlocks in {status.daysUntilNext} day{status.daysUntilNext === 1 ? "" : "s"}.
        </p>
        <ButtonLink href="/progress" variant="secondary" className="mt-6">
          Back to progress
        </ButtonLink>
      </div>
    );
  }

  return <MonthlyTestRunner monthIndex={lockedMonthIndex} />;
}
