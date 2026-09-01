"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function CardFormDialog({
  open,
  onOpenChange,
  initialFront = "",
  initialBack = "",
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFront?: string;
  initialBack?: string;
  onSubmit: (front: string, back: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Body is mounted only while the dialog is open, so useState
            initializers below reset the form on every open. */}
        <CardFormBody initialFront={initialFront} initialBack={initialBack} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CardFormBody({
  initialFront,
  initialBack,
  onSubmit,
  onClose,
}: {
  initialFront: string;
  initialBack: string;
  onSubmit: (front: string, back: string) => void;
  onClose: () => void;
}) {
  const [front, setFront] = React.useState(initialFront);
  const [back, setBack] = React.useState(initialBack);

  function submit() {
    if (!front.trim() || !back.trim()) return;
    onSubmit(front.trim(), back.trim());
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialFront ? "Karte bearbeiten" : "Neue Karte"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Vorderseite</Label>
          <Textarea autoFocus rows={2} placeholder="Frage oder Stichwort" value={front} onChange={(e) => setFront(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Rückseite</Label>
          <Textarea rows={3} placeholder="Antwort" value={back} onChange={(e) => setBack(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!front.trim() || !back.trim()}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
