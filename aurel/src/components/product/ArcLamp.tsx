"use client";

import { useId } from "react";
import { useT } from "@/lib/i18n";
import { getFinish, getModel, type FinishId, type ModelId } from "@/lib/products";
import { kelvinToCss } from "@/lib/format";
import { cn } from "@/components/ui/cn";

interface ArcLampProps {
  finishId: FinishId;
  modelId?: ModelId;
  /** 1800–6500. Drives the emitted colour across every light layer. */
  kelvin?: number;
  /** 0–1 output. Scales the glow, the cone and the pool together. */
  intensity?: number;
  /** Draw the desk pool + volumetric cone. Off for small inline renders. */
  showLight?: boolean;
  className?: string;
  title?: string;
}

/**
 * The ARC, drawn as vector geometry rather than photographed.
 *
 * Everything the light does — the diffuser, the beam, the pool on the desk —
 * derives from `kelvin` and `intensity`, so the hero scrubber, the variant
 * picker and the cart thumbnail all render the same lamp from the same two
 * numbers.
 */
export function ArcLamp({
  finishId,
  modelId = "arc",
  kelvin = 3200,
  intensity = 1,
  showLight = true,
  className,
  title,
}: ArcLampProps) {
  const uid = useId().replace(/:/g, "");
  const finish = getFinish(finishId);
  const t = useT();
  const model = getModel(modelId);

  const glow = kelvinToCss(kelvin);
  const glowSoft = kelvinToCss(kelvin, 0.55);
  const glowCore = kelvinToCss(kelvin, 0.86);

  const half = model.barWidth / 2;
  const barLeft = 320 - half;
  const barRight = 320 + half;
  const i = Math.min(1, Math.max(0, intensity));

  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      viewBox="0 52 640 366"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={title ?? `AUREL ${model.name} — ${t.finishes[finishId].name}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Anodised aluminium, lit from above-left. */}
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={finish.bodyLight} />
          <stop offset="34%" stopColor={finish.body} />
          <stop offset="78%" stopColor={finish.bodyDark} />
          <stop offset="100%" stopColor={finish.body} />
        </linearGradient>

        <linearGradient id={id("stem")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={finish.bodyDark} />
          <stop offset="30%" stopColor={finish.bodyLight} />
          <stop offset="62%" stopColor={finish.body} />
          <stop offset="100%" stopColor={finish.bodyDark} />
        </linearGradient>

        <linearGradient id={id("baseTop")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={finish.bodyLight} />
          <stop offset="52%" stopColor={finish.body} />
          <stop offset="100%" stopColor={finish.bodyDark} />
        </linearGradient>

        <linearGradient id={id("baseSide")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={finish.bodyDark} />
          <stop offset="26%" stopColor={finish.body} />
          <stop offset="55%" stopColor={finish.bodyLight} />
          <stop offset="100%" stopColor={finish.bodyDark} />
        </linearGradient>

        {/* The emitting strip: hot core falling off to the housing. */}
        <linearGradient id={id("emit")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={glowCore} />
          <stop offset="55%" stopColor={glowSoft} />
          <stop offset="100%" stopColor={glow} />
        </linearGradient>

        {/* Ends of the bar fade — a real diffuser is dimmer at the extremes. */}
        <linearGradient id={id("emitMask")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" />
          <stop offset="7%" stopColor="#fff" />
          <stop offset="93%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <mask id={id("barMask")}>
          <rect x={barLeft} y="120" width={model.barWidth} height="20" fill={`url(#${id("emitMask")})`} />
        </mask>

        {/* Volumetric beam. */}
        <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={glow} stopOpacity={0.5 * i} />
          <stop offset="45%" stopColor={glow} stopOpacity={0.18 * i} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </linearGradient>

        {/* Pool of light on the desk. */}
        <radialGradient id={id("pool")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowSoft} stopOpacity={0.92 * i} />
          <stop offset="42%" stopColor={glow} stopOpacity={0.46 * i} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>

        {/* Ambient bloom around the bar. */}
        <radialGradient id={id("bloom")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={0.5 * i} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>

        <radialGradient id={id("contact")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#131211" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#131211" stopOpacity="0" />
        </radialGradient>

        <filter id={id("soften")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id("softenLg")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {showLight ? (
        <>
          {/* pool on the desk */}
          <ellipse
            cx="320"
            cy="358"
            rx={half + 190}
            ry="54"
            fill={`url(#${id("pool")})`}
          />
          {/* beam volume */}
          <path
            d={`M ${barLeft + 6} 138 L ${barRight - 6} 138 L ${barRight + 84} 358 L ${barLeft - 84} 358 Z`}
            fill={`url(#${id("cone")})`}
            filter={`url(#${id("soften")})`}
          />
          {/* bloom around the bar */}
          <ellipse
            cx="320"
            cy="128"
            rx={half + 118}
            ry="72"
            fill={`url(#${id("bloom")})`}
            filter={`url(#${id("softenLg")})`}
          />
        </>
      ) : null}

      {/* ── contact shadow ─────────────────────────────────────────── */}
      <ellipse cx="320" cy="348" rx="104" ry="17" fill={`url(#${id("contact")})`} />

      {/* ── stem ───────────────────────────────────────────────────── */}
      <rect x="313" y="126" width="14" height="204" rx="6" fill={`url(#${id("stem")})`} />
      {/* stem specular */}
      <rect x="316" y="132" width="2.5" height="190" rx="1.25" fill={finish.bodyLight} opacity="0.55" />
      {/* joint collar */}
      <rect x="308" y="126" width="24" height="9" rx="3.5" fill={`url(#${id("baseTop")})`} />

      {/* ── base ───────────────────────────────────────────────────── */}
      <path
        d="M 252 332 L 252 342 A 68 17 0 0 0 388 342 L 388 332 Z"
        fill={`url(#${id("baseSide")})`}
      />
      <ellipse cx="320" cy="332" rx="68" ry="17" fill={`url(#${id("baseTop")})`} />
      {/* machined ring on the base top */}
      <ellipse
        cx="320"
        cy="332"
        rx="55"
        ry="13"
        fill="none"
        stroke={finish.bodyDark}
        strokeWidth="0.75"
        opacity="0.5"
      />

      {/* the dial, forward of the stem */}
      <ellipse cx="320" cy="340" rx="26" ry="7.5" fill={finish.bodyDark} opacity="0.55" />
      <ellipse cx="320" cy="338.5" rx="26" ry="7.5" fill={`url(#${id("baseTop")})`} />
      <ellipse
        cx="320"
        cy="338.5"
        rx="26"
        ry="7.5"
        fill="none"
        stroke={finish.bodyLight}
        strokeWidth="0.75"
        opacity="0.7"
      />
      {/* knurling — the detail you feel before you see */}
      {Array.from({ length: 15 }).map((_, k) => {
        const t = (k / 14) * Math.PI;
        const x = 320 + Math.cos(t) * 26;
        const y = 338.5 + Math.sin(t) * 7.5;
        return (
          <line
            key={k}
            x1={x}
            y1={y - 1.2}
            x2={x}
            y2={y + 1.2}
            stroke={finish.bodyDark}
            strokeWidth="0.7"
            opacity="0.42"
          />
        );
      })}
      {/* index mark, lit by the lamp's current temperature */}
      <circle cx="320" cy="331" r="1.9" fill={glow} opacity={0.35 + 0.65 * i} />

      {/* ── light bar ──────────────────────────────────────────────── */}
      {/* housing */}
      <rect
        x={barLeft}
        y="104"
        width={model.barWidth}
        height="24"
        rx="11"
        fill={`url(#${id("body")})`}
      />
      {/* top specular line */}
      <rect
        x={barLeft + 14}
        y="107.5"
        width={model.barWidth - 28}
        height="2"
        rx="1"
        fill={finish.bodyLight}
        opacity="0.7"
      />
      {/* seam between housing and diffuser */}
      <rect
        x={barLeft + 4}
        y="123.5"
        width={model.barWidth - 8}
        height="1"
        fill={finish.bodyDark}
        opacity="0.6"
      />
      {/* diffuser — the emitting face */}
      <g mask={`url(#${id("barMask")})`}>
        <rect
          x={barLeft + 6}
          y="124"
          width={model.barWidth - 12}
          height="10"
          rx="5"
          fill={`url(#${id("emit")})`}
          opacity={0.28 + 0.72 * i}
        />
        {/* hot core */}
        <rect
          x={barLeft + 10}
          y="126"
          width={model.barWidth - 20}
          height="4"
          rx="2"
          fill={glowCore}
          opacity={0.3 + 0.7 * i}
        />
      </g>
      {/* end caps */}
      <rect x={barLeft} y="104" width="9" height="24" rx="4.5" fill={finish.bodyDark} opacity="0.9" />
      <rect x={barRight - 9} y="104" width="9" height="24" rx="4.5" fill={finish.bodyDark} opacity="0.9" />
    </svg>
  );
}
