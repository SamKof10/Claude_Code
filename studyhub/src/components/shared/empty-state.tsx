import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-2">
        <Icon className="size-5 text-ink-3" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] text-ink-3">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
