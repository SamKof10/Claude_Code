"use client";

import { useRef } from "react";
import { SubmitButton } from "./submit-button";

/**
 * Zerstörende Aktionen laufen über einen echten Dialog statt direkt auf den
 * Klick — Escape und ein Abbrechen-Weg gehören dazu. <dialog> bringt
 * Fokusfalle und Tastaturbedienung von Haus aus mit.
 */
export function ConfirmForm({
  action,
  triggerLabel,
  title,
  body,
  confirmLabel,
}: {
  action: () => Promise<void>;
  triggerLabel: string;
  title: string;
  body: string;
  confirmLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="flex h-12 w-full items-center justify-center rounded-field border border-danger/45 text-[15px] font-semibold text-danger-bright"
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(340px,calc(100vw-40px))] rounded-2xl bg-raised p-0 text-ink backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-2 px-5 pb-4 pt-5 text-center">
          <h2 id="confirm-title" className="text-[17px] font-semibold leading-[22px]">
            {title}
          </h2>
          <p className="text-[13px] leading-[18px] text-ink-2 text-pretty">{body}</p>
        </div>
        <div className="flex flex-col border-t border-line">
          <form action={action}>
            <SubmitButton
              label={confirmLabel}
              pendingLabel="Lösche…"
              className="h-12 w-full rounded-none !bg-transparent !text-danger-bright"
            />
          </form>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="h-12 w-full border-t border-line text-[17px] font-semibold text-ink"
          >
            Abbrechen
          </button>
        </div>
      </dialog>
    </>
  );
}
