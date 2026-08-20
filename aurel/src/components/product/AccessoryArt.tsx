"use client";

import { useId } from "react";
import { useT } from "@/lib/i18n";
import { getFinish, type AccessoryId, type FinishId } from "@/lib/products";
import { kelvinToCss } from "@/lib/format";
import { cn } from "@/components/ui/cn";

interface AccessoryArtProps {
  accessoryId: AccessoryId;
  finishId: FinishId;
  kelvin?: number;
  intensity?: number;
  showLight?: boolean;
  className?: string;
}

/**
 * The two mounts, drawn in the same vector language as the lamp itself:
 * the ARC is always the same bar, only what holds it changes.
 */
export function AccessoryArt({
  accessoryId,
  finishId,
  kelvin = 3200,
  intensity = 0.9,
  showLight = true,
  className,
}: AccessoryArtProps) {
  const uid = useId().replace(/:/g, "");
  const finish = getFinish(finishId);
  const t = useT();
  const id = (n: string) => `${n}-${uid}`;

  const glow = kelvinToCss(kelvin);
  const glowSoft = kelvinToCss(kelvin, 0.55);
  const glowCore = kelvinToCss(kelvin, 0.86);
  const i = Math.min(1, Math.max(0, intensity));

  const isClip = accessoryId === "clip";
  const barCx = isClip ? 320 : 400;
  const barHalf = isClip ? 112 : 96;
  const barTop = isClip ? 92 : 62;

  const defs = (
    <defs>
      <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={finish.bodyLight} />
        <stop offset="36%" stopColor={finish.body} />
        <stop offset="100%" stopColor={finish.bodyDark} />
      </linearGradient>
      <linearGradient id={id("post")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={finish.bodyDark} />
        <stop offset="32%" stopColor={finish.bodyLight} />
        <stop offset="100%" stopColor={finish.bodyDark} />
      </linearGradient>
      <linearGradient id={id("emit")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={glowCore} />
        <stop offset="100%" stopColor={glow} />
      </linearGradient>
      <radialGradient id={id("pool")} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowSoft} stopOpacity={0.9 * i} />
        <stop offset="44%" stopColor={glow} stopOpacity={0.4 * i} />
        <stop offset="100%" stopColor={glow} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={id("bloom")} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glow} stopOpacity={0.45 * i} />
        <stop offset="100%" stopColor={glow} stopOpacity={0} />
      </radialGradient>
      <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={glow} stopOpacity={0.4 * i} />
        <stop offset="100%" stopColor={glow} stopOpacity={0} />
      </linearGradient>
      <filter id={id("soft")} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </defs>
  );

  /** The ARC itself — identical on both mounts. */
  const bar = (
    <>
      <rect
        x={barCx - barHalf}
        y={barTop}
        width={barHalf * 2}
        height="22"
        rx="10"
        fill={`url(#${id("body")})`}
      />
      <rect
        x={barCx - barHalf + 12}
        y={barTop + 3}
        width={barHalf * 2 - 24}
        height="1.8"
        rx="0.9"
        fill={finish.bodyLight}
        opacity="0.7"
      />
      <rect
        x={barCx - barHalf + 6}
        y={barTop + 19}
        width={barHalf * 2 - 12}
        height="9"
        rx="4.5"
        fill={`url(#${id("emit")})`}
        opacity={0.3 + 0.7 * i}
      />
      <rect x={barCx - barHalf} y={barTop} width="8" height="22" rx="4" fill={finish.bodyDark} opacity="0.9" />
      <rect x={barCx + barHalf - 8} y={barTop} width="8" height="22" rx="4" fill={finish.bodyDark} opacity="0.9" />
    </>
  );

  return (
    <svg
      viewBox="0 0 640 366"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={
        isClip
          ? `AUREL CLIP — ${t.accessories.clip.title}, ${t.finishes[finishId].name}`
          : `AUREL ARCH — ${t.accessories.arch.title}, ${t.finishes[finishId].name}`
      }
      style={{ overflow: "visible" }}
    >
      {defs}

      {showLight ? (
        <ellipse
          cx={barCx}
          cy="120"
          rx={barHalf + 90}
          ry="62"
          fill={`url(#${id("bloom")})`}
          filter={`url(#${id("soft")})`}
        />
      ) : null}

      {isClip ? (
        <>
          {/* the desk in front of the screen, where the light actually lands */}
          {showLight ? (
            <ellipse cx="320" cy="330" rx="238" ry="30" fill={`url(#${id("pool")})`} />
          ) : null}

          {/* monitor */}
          <rect x="182" y="118" width="276" height="184" rx="9" fill="#26262a" />
          <rect x="190" y="126" width="260" height="160" rx="4" fill="#121215" />
          <rect x="190" y="126" width="260" height="160" rx="4" fill="#1b1b20" opacity="0.7" />
          <rect x="308" y="302" width="24" height="18" fill="#26262a" />
          <ellipse cx="320" cy="322" rx="66" ry="9" fill="#26262a" />
          <ellipse cx="320" cy="320" rx="66" ry="9" fill="#313136" />

          {/* the clip: hooks over the top edge, counterweight behind */}
          <path
            d={`M ${barCx - 16} 114 h 32 v 12 h -10 v -6 h -12 v 10 h -10 z`}
            fill={`url(#${id("post")})`}
          />
          <rect x={barCx - 26} y="126" width="20" height="9" rx="3" fill={finish.bodyDark} />

          {bar}
        </>
      ) : (
        <>
          {showLight ? (
            <>
              <ellipse cx={barCx} cy="330" rx="206" ry="30" fill={`url(#${id("pool")})`} />
              <path
                d={`M ${barCx - barHalf + 8} 90 L ${barCx + barHalf - 8} 90 L ${barCx + 118} 330 L ${
                  barCx - 118
                } 330 Z`}
                fill={`url(#${id("cone")})`}
                filter={`url(#${id("soft")})`}
              />
            </>
          ) : null}

          {/* weighted foot */}
          <path d="M 138 316 L 138 326 A 64 14 0 0 0 266 326 L 266 316 Z" fill={finish.bodyDark} />
          <ellipse cx="202" cy="316" rx="64" ry="14" fill={`url(#${id("body")})`} />

          {/* post and the arm that carries the bar out over the desk */}
          <rect x="194" y="150" width="16" height="168" rx="6" fill={`url(#${id("post")})`} />
          <path
            d={`M 202 156 C 202 84 248 66 320 66 L ${barCx} 66`}
            fill="none"
            stroke={`url(#${id("post")})`}
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* the drop onto the bar */}
          <rect x={barCx - 7} y="60" width="14" height="18" rx="5" fill={finish.body} />

          {bar}
        </>
      )}
    </svg>
  );
}
