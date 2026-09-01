"use client";

import * as React from "react";
import { toast } from "sonner";
import { useNow } from "@/lib/clock";
import { playChime } from "@/lib/chime";
import { useStudyStore } from "@/lib/store";
import { PHASE_LABEL, useFocusStore } from "@/lib/store/focus";
import { formatClock } from "@/lib/utils";

/**
 * Runs the focus timer to completion, mounted once in the app shell.
 *
 * Completion lives here rather than in the timer components so a block still
 * finishes — and still gets logged — while you are on another page, and so two
 * mounted views can't both credit the same block.
 */
export function FocusDriver() {
  const status = useFocusStore((s) => s.status);
  const endsAt = useFocusStore((s) => s.endsAt);
  const chime = useFocusStore((s) => s.settings.chime);
  const finish = useFocusStore((s) => s.finish);
  const logStudySession = useStudyStore((s) => s.logStudySession);
  const now = useNow();
  const baseTitle = React.useRef<string | null>(null);

  const due = status === "running" && endsAt !== null && now >= endsAt && now > 0;

  React.useEffect(() => {
    if (!due) return;
    const finished = finish();
    if (!finished) return;

    if (finished.phase === "focus") {
      logStudySession({ subjectId: finished.subjectId, durationMinutes: finished.minutes, type: "focus" });
      toast.success(`${finished.minutes} Minuten Fokus verbucht`, { description: "Zählt zu deiner heutigen Lernzeit." });
    } else {
      toast(`${PHASE_LABEL[finished.phase]} vorbei`, { description: "Bereit für den nächsten Block." });
    }
    if (chime) playChime();
  }, [due, finish, logStudySession, chime]);

  // Countdown in the tab title, so a backgrounded StudyHub still tells you
  // where the block is.
  React.useEffect(() => {
    if (status !== "running" || endsAt === null || now === 0) {
      if (baseTitle.current !== null) {
        document.title = baseTitle.current;
        baseTitle.current = null;
      }
      return;
    }
    baseTitle.current ??= document.title;
    document.title = `${formatClock(endsAt - now)} · ${baseTitle.current}`;
  }, [status, endsAt, now]);

  return null;
}
