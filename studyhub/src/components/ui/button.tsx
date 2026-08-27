"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "signal-gradient text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-8px_rgba(124,108,255,0.55)] hover:brightness-110 active:brightness-95",
        secondary:
          "bg-surface-2 text-ink border border-border hover:bg-surface-hover hover:border-border-strong",
        outline:
          "border border-border bg-transparent text-ink hover:bg-surface-2 hover:border-border-strong",
        ghost: "text-ink-2 hover:text-ink hover:bg-surface-2",
        destructive: "bg-danger text-white hover:brightness-110",
        link: "text-ink underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-3 text-[13px] rounded-md",
        lg: "h-11 px-5 text-[15px] rounded-xl",
        icon: "h-9 w-9 shrink-0",
        "icon-sm": "h-7 w-7 shrink-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
