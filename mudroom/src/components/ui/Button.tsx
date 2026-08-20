"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

/* Every size clears 44 px of touch target — the machine is used in gloves. */
const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-[11px] tracking-[0.14em]",
  md: "h-12 px-6 text-[12px] tracking-[0.14em]",
  lg: "h-14 px-8 text-[13px] tracking-[0.13em]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-hivis text-steel hover:bg-hivis-deep active:bg-hivis-deep shimmer overflow-hidden",
  outline:
    "border border-[var(--edge-strong)] text-concrete hover:border-hivis hover:text-hivis bg-transparent",
  ghost: "text-concrete/70 hover:text-concrete bg-transparent",
  light:
    "bg-steel text-concrete hover:bg-steel-3 border border-transparent",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Trailing icon slot — kept separate so the label stays centred. */
  icon?: ReactNode;
  full?: boolean;
}

const base =
  "relative inline-flex items-center justify-center gap-2.5 rounded-[3px] font-mono font-medium uppercase " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out-soft)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-40 select-none";

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(
  { variant = "primary", size = "md", className, children, icon, full, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], full && "w-full", className)}
      {...rest}
    >
      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        {icon}
      </span>
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  full,
  onClick,
}: CommonProps & { href: string; onClick?: () => void }) {
  const isHash = href.startsWith("#");
  const classes = cn(base, sizes[size], variants[variant], full && "w-full", className);
  const inner = (
    <span className="relative z-10 flex items-center gap-2.5">
      {children}
      {icon}
    </span>
  );

  if (isHash) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {inner}
    </Link>
  );
}
