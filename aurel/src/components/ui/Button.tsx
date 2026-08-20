"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useHasPointer, useMagnetic } from "@/hooks";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "night" | "nightSecondary";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "active:scale-[0.975] disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper shadow-[0_1px_2px_rgba(19,18,17,0.18),0_8px_24px_-10px_rgba(19,18,17,0.6)] " +
    "hover:shadow-[0_1px_2px_rgba(19,18,17,0.2),0_14px_36px_-12px_rgba(19,18,17,0.7)] hover:bg-[#000]",
  secondary:
    "border border-[var(--line-strong)] text-ink bg-transparent hover:bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)]",
  ghost: "text-ink-2 hover:text-ink",
  night:
    "bg-paper text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] hover:bg-white",
  nightSecondary:
    "border border-[var(--line-night-strong)] text-paper bg-transparent hover:bg-[color-mix(in_srgb,white_8%,transparent)]",
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
  /**
   * Mid-action: swallows further clicks without the dimmed look of
   * `disabled`, so a success confirmation still reads as a success.
   */
  busy?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    magnetic = false,
    shimmer = false,
    busy = false,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const hasPointer = useHasPointer();
  const { ref, offset } = useMagnetic<HTMLButtonElement>(0.18, magnetic && hasPointer);

  return (
    <button
      ref={(node) => {
        ref.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      aria-busy={busy || undefined}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        shimmer && "shimmer",
        busy && "pointer-events-none",
        className,
      )}
      style={
        magnetic && hasPointer
          ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
          : undefined
      }
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

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  magnetic = false,
  shimmer = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const hasPointer = useHasPointer();
  const { ref, offset } = useMagnetic<HTMLAnchorElement>(0.18, magnetic && hasPointer);
  const isInternal = href.startsWith("/");

  const props = {
    ref,
    className: cn(base, variants[variant], sizes[size], shimmer && "shimmer", className),
    style:
      magnetic && hasPointer
        ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
        : undefined,
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
