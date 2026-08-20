"use client";

import { forwardRef, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { useHasPointer, useMagnetic } from "@/hooks";
import { cn } from "./cn";

/** Magic UI's "Ripple Button": a short-lived expanding disc from the
 * pointer-down point (`.ripple-el` in globals.css). Appends directly to
 * the element clicked and removes itself — no React state involved. */
function spawnRipple(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple-el";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  el.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 700);
}

type Variant = "primary" | "secondary" | "ghost" | "mint" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "active:scale-[0.975] disabled:pointer-events-none disabled:opacity-40 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_10px_28px_-10px_rgba(124,108,255,0.7)] " +
    "hover:bg-[color-mix(in_srgb,var(--color-signal)_88%,white)]",
  secondary:
    "border border-[var(--line-strong)] text-ink-1 bg-surface-1/60 hover:bg-surface-2",
  ghost: "text-ink-2 hover:text-ink-1 hover:bg-surface-2",
  mint:
    "bg-mint text-[#04231b] shadow-[0_10px_28px_-10px_rgba(34,211,166,0.65)] hover:bg-[color-mix(in_srgb,var(--color-mint)_88%,white)]",
  danger: "border border-coral/40 text-coral hover:bg-coral/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-13 px-7 text-[15px] min-h-[52px]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  shimmer?: boolean;
  ripple?: boolean;
  busy?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", magnetic = false, shimmer = false, ripple = false, busy = false, className, children, onPointerDown, ...rest },
  forwardedRef,
) {
  const hasPointer = useHasPointer();
  const { ref, offset } = useMagnetic<HTMLButtonElement>(0.16, magnetic && hasPointer);

  return (
    <button
      ref={(node) => {
        ref.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      aria-busy={busy || undefined}
      className={cn(base, variants[variant], sizes[size], shimmer && "shimmer", busy && "pointer-events-none", className)}
      style={magnetic && hasPointer ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` } : undefined}
      onPointerDown={(e) => {
        if (ripple) spawnRipple(e);
        onPointerDown?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

interface ButtonLinkProps extends CommonProps {
  href: string;
  onClick?: () => void;
  "aria-label"?: string;
}

export function ButtonLink({ href, variant = "primary", size = "md", magnetic = false, shimmer = false, ripple = false, className, children, ...rest }: ButtonLinkProps) {
  const hasPointer = useHasPointer();
  const { ref, offset } = useMagnetic<HTMLAnchorElement>(0.16, magnetic && hasPointer);
  const isInternal = href.startsWith("/");

  const props = {
    ref,
    className: cn(base, variants[variant], sizes[size], shimmer && "shimmer", className),
    style: magnetic && hasPointer ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` } : undefined,
    onPointerDown: ripple ? spawnRipple : undefined,
    ...rest,
  };

  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
