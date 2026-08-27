"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn("inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 h-7 text-[13px] font-medium text-ink-3 transition-all data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-sm hover:text-ink focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
