"use client";

import { ArcLamp } from "@/components/product/ArcLamp";
import { AccessoryArt } from "@/components/product/AccessoryArt";
import type { CartLine } from "@/lib/cart";
import { cn } from "@/components/ui/cn";

/** One thumbnail that knows how to draw whichever kind of line it is given. */
export function LineThumb({ line, className }: { line: CartLine; className?: string }) {
  if (line.kind === "accessory" && line.accessoryId) {
    return (
      <AccessoryArt
        accessoryId={line.accessoryId}
        finishId={line.finishId}
        showLight={false}
        intensity={0.45}
        className={cn("w-full", className)}
      />
    );
  }
  return (
    <ArcLamp
      finishId={line.finishId}
      modelId={line.modelId ?? "arc"}
      showLight={false}
      intensity={0.45}
      className={cn("w-full", className)}
    />
  );
}
