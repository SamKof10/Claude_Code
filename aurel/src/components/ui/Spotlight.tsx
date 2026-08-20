"use client";

import { useRef, useState, type ReactNode } from "react";
import { useHasPointer } from "@/hooks";
import { cn } from "./cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Colour of the cursor-following glow. */
  glow?: string;
  radius?: number;
}

/**
 * A card with a soft light that follows the cursor. The glow is a single
 * radial-gradient layer driven by two CSS variables, so tracking never
 * triggers layout or paint of the content beneath it.
 */
export function SpotlightCard({
  children,
  className,
  glow = "color-mix(in srgb, var(--color-ember) 26%, transparent)",
  radius = 320,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const hasPointer = useHasPointer();
  const frame = useRef<number | null>(null);

  return (
    <div
      ref={ref}
      className={cn("group relative overflow-hidden", className)}
      onPointerMove={
        hasPointer
          ? (e) => {
              if (frame.current !== null) return;
              const { clientX, clientY } = e;
              frame.current = requestAnimationFrame(() => {
                frame.current = null;
                const rect = ref.current?.getBoundingClientRect();
                if (!rect) return;
                setPos({ x: clientX - rect.left, y: clientY - rect.top });
              });
            }
          : undefined
      }
      onPointerLeave={hasPointer ? () => setPos(null) : undefined}
    >
      {hasPointer ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: pos
              ? `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, ${glow}, transparent 68%)`
              : undefined,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
