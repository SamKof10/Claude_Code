"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  /**
   * For actions there is no coming back from, require the word to be typed.
   * HIG Accessibility (Cognitive): "Always ask for confirmation twice whenever
   * people perform an action that's difficult to recover from."
   */
  confirmPhrase,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  confirmPhrase?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Keyed body so the typed phrase never survives a reopen. */}
        <ConfirmBody
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          destructive={destructive}
          confirmPhrase={confirmPhrase}
          onConfirm={onConfirm}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ConfirmBody({
  title,
  description,
  confirmLabel,
  destructive,
  confirmPhrase,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  confirmPhrase?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = React.useState("");
  const inputId = React.useId();
  const unlocked = !confirmPhrase || typed.trim().toUpperCase() === confirmPhrase.toUpperCase();

  function confirm() {
    if (!unlocked) return;
    onConfirm();
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {confirmPhrase && (
        <div className="space-y-1.5">
          <Label htmlFor={inputId}>
            Type <span className="font-mono font-semibold text-ink">{confirmPhrase}</span> to confirm
          </Label>
          <Input
            id={inputId}
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={destructive ? "destructive" : "default"} onClick={confirm} disabled={!unlocked}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
