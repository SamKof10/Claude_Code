import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "warning" | "success";
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="mono-label">{label}</span>
        <Icon
          className={cn(
            "size-[15px]",
            tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-ink-3"
          )}
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-ink-3">{hint}</p>}
    </Card>
  );
}
