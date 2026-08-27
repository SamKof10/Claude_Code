import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-normal",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-ink-2",
        signal: "border-transparent bg-[color-mix(in_srgb,var(--color-signal)_16%,transparent)] text-[var(--color-signal-2)]",
        success: "border-transparent bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success",
        warning: "border-transparent bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-warning",
        danger: "border-transparent bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-danger",
        outline: "border-border text-ink-2 bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
