"use client";

import { useId } from "react";
import { cn } from "@/components/ui/cn";

export interface WashBoxProps {
  /** 0 = door fully up, 1 = fully down. */
  door?: number;
  /** Brushes turning and jets running. */
  washing?: boolean;
  /** How hard the wash is running, 0–1. Drives spray density. */
  intensity?: number;
  /** Interior work light. */
  lit?: boolean;
  /** Body colour of the cabinet. */
  shell?: string;
  /**
   * "back" draws only what sits behind the bike (bay, walls, floor, light),
   * "front" everything in front of it (brushes, spray, glass, door, the
   * cabinet itself). WashScene stacks back → bike → front, so the cabinet
   * body masks the bike on its way in and out and the closed door actually
   * covers it.
   */
  layer?: "all" | "back" | "front";
  className?: string;
}

/* One coordinate frame for the whole machine. Exported so the bike overlay
   can be positioned against exactly these numbers. */
export const BOX = {
  vw: 1000,
  vh: 620,
  /* cabinet */
  cabL: 22,
  cabR: 978,
  cabT: 18,
  cabB: 596,
  radius: 26,
  /* the bay window */
  openL: 80,
  openR: 752,
  openTop: 132,
  openBottom: 540,
  /* the line the tyres stand on */
  floor: 502,
  /* control panel */
  panL: 782,
  panR: 950,
  panT: 150,
  panB: 536,
};

const NOZZLES = [160, 288, 416, 544, 672];

/* Brush columns: parked position and how far they close in on the bike. */
const BRUSHES = [
  { x: 104, close: 42 },
  { x: 652, close: -42 },
];
const BRUSH_TOP = 246;
const BRUSH_BOTTOM = 505;
const BRUSH_W = 38;

const PANEL_PROGRAMS = [
  { name: "QUICK WASH", time: "3 MIN" },
  { name: "MUD MODE", time: "5 MIN" },
  { name: "DEEP CLEAN", time: "6 MIN" },
  { name: "E-BIKE MODE", time: "4 MIN" },
];

/* Bristles: short spikes either side of each column. Fixed pattern — a
   random one would redraw itself on every frame and shimmer. */
const BRISTLES = Array.from({ length: 46 }).map((_, k) => {
  const seed = (k * 43) % 31;
  return { t: k / 45, len: 6 + (seed % 6), skew: (seed % 3) - 1 };
});

/* Water running down the inside of the glass. */
const STREAKS = Array.from({ length: 9 }).map((_, k) => {
  const seed = (k * 53) % 97;
  return { x: 96 + ((seed * 7) % 640), top: 140 + (seed % 90), len: 90 + (seed % 150), o: 0.05 + (seed % 4) / 60 };
});

export function WashBox({
  door = 0,
  washing = false,
  intensity = 1,
  lit = true,
  shell = "#20252a",
  layer = "all",
  className,
}: WashBoxProps) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const back = layer === "all" || layer === "back";
  const front = layer === "all" || layer === "front";

  const d = Math.min(1, Math.max(0, door));
  const i = Math.min(1, Math.max(0, intensity));
  const openH = BOX.openBottom - BOX.openTop;
  const doorH = d * openH;
  const openW = BOX.openR - BOX.openL;

  return (
    <svg
      viewBox={`0 0 ${BOX.vw} ${BOX.vh}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="MUDROOM ONE automatic bike wash box"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={id("cabinet")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5359" />
          <stop offset="8%" stopColor={shell} />
          <stop offset="72%" stopColor="#191f23" />
          <stop offset="100%" stopColor="#0b0f12" />
        </linearGradient>

        {/* the bay: brushed steel, lit from the ceiling */}
        <linearGradient id={id("bay")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lit ? "#c3cacd" : "#4c5357"} />
          <stop offset="34%" stopColor={lit ? "#9ea7ab" : "#3d4448"} />
          <stop offset="76%" stopColor={lit ? "#727c81" : "#2c3235"} />
          <stop offset="100%" stopColor="#4d5559" />
        </linearGradient>

        <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={id("jet")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-water)" stopOpacity={0.55 * i} />
          <stop offset="100%" stopColor="var(--color-water)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={id("brush")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e1113" />
          <stop offset="34%" stopColor="#2b3236" />
          <stop offset="52%" stopColor="#39434a" />
          <stop offset="72%" stopColor="#20262a" />
          <stop offset="100%" stopColor="#0b0e10" />
        </linearGradient>

        <linearGradient id={id("glass")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#e9eae5" stopOpacity="0.11" />
          <stop offset="38%" stopColor="#e9eae5" stopOpacity="0.02" />
          <stop offset="60%" stopColor="#e9eae5" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#e9eae5" stopOpacity="0.01" />
        </linearGradient>

        <linearGradient id={id("door")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e353a" />
          <stop offset="100%" stopColor="#171d21" />
        </linearGradient>

        {/* bristle stripes, travelling sideways — what a spinning column
            actually looks like head-on */}
        <pattern id={id("bristle")} width="14" height="9" patternUnits="userSpaceOnUse" patternTransform="skewY(-10)">
          <rect width="14" height="9" fill="#171c1f" />
          <rect width="6" height="9" fill="#2f373c" />
        </pattern>

        <clipPath id={id("bay-clip")}>
          <rect x={BOX.openL} y={BOX.openTop} width={openW} height={openH} rx="12" />
        </clipPath>

        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={id("glow")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {back ? (
        <>
          {/* ── ambient: the machine sits in a dark room ─────────────── */}
          <ellipse
            cx={BOX.vw / 2}
            cy={BOX.cabB + 22}
            rx="430"
            ry="26"
            fill="#000"
            opacity="0.55"
            filter={`url(#${id("soft")})`}
          />

          {/* ── the bay ──────────────────────────────────────────────── */}
          <rect
            x={BOX.openL}
            y={BOX.openTop}
            width={openW}
            height={openH}
            rx="12"
            fill={`url(#${id("bay")})`}
          />

          <g clipPath={`url(#${id("bay-clip")})`}>
            {/* wall panel joints */}
            {[0, 1, 2, 3, 4, 5, 6].map((k) => {
              const x = BOX.openL + 46 + k * 92;
              return (
                <g key={k}>
                  <line x1={x} y1={BOX.openTop} x2={x} y2={BOX.floor} stroke="#000" strokeWidth="2.4" opacity="0.22" />
                  <line x1={x + 2.4} y1={BOX.openTop} x2={x + 2.4} y2={BOX.floor} stroke="#fff" strokeWidth="1.2" opacity="0.09" />
                </g>
              );
            })}

            {/* corner falloff, so the bay reads as a box and not a wall */}
            <rect x={BOX.openL} y={BOX.openTop} width="54" height={openH} fill="#000" opacity="0.13" />
            <rect x={BOX.openR - 54} y={BOX.openTop} width="54" height={openH} fill="#000" opacity="0.13" />

            {/* ── ceiling rail + nozzles ─────────────────────────────── */}
            <rect x={BOX.openL} y={BOX.openTop} width={openW} height="26" fill="#1b2124" />
            <rect x={BOX.openL} y={BOX.openTop + 24} width={openW} height="2" fill="#e9eae5" opacity="0.18" />
            <rect x={BOX.openL + 24} y={BOX.openTop + 28} width={openW - 48} height="7" rx="3.5" fill="#2b3236" />

            {NOZZLES.map((x) => (
              <g key={x}>
                {/* light cone */}
                <path
                  d={`M ${x - 7} ${BOX.openTop + 36} L ${x - 44} ${BOX.floor - 6} L ${x + 44} ${BOX.floor - 6} L ${x + 7} ${BOX.openTop + 36} Z`}
                  fill={`url(#${id("cone")})`}
                  opacity={lit ? 1 : 0.25}
                />
                <rect x={x - 5} y={BOX.openTop + 33} width="10" height="11" rx="2.5" fill="#3b4449" />
                <circle cx={x} cy={BOX.openTop + 45} r="3" fill={lit ? "#ffffff" : "#5b6469"} opacity="0.9" />
              </g>
            ))}

            {/* ── floor ──────────────────────────────────────────────── */}
            <rect x={BOX.openL} y={BOX.floor - 4} width={openW} height={BOX.openBottom - BOX.floor + 4} fill="#161b1e" />
            {Array.from({ length: 26 }).map((_, k) => (
              <rect
                key={k}
                x={BOX.openL + 10 + k * 26}
                y={BOX.floor + 4}
                width="15"
                height={BOX.openBottom - BOX.floor - 12}
                rx="2"
                fill="#232a2e"
              />
            ))}
            <rect x={BOX.openL} y={BOX.floor - 5} width={openW} height="3" fill="#e9eae5" opacity="0.12" />

            {/* wheel stand the bike rests in */}
            <path
              d={`M ${BOX.openL + 300} ${BOX.floor} L ${BOX.openL + 316} ${BOX.floor - 26} L ${BOX.openL + 356} ${BOX.floor - 26} L ${BOX.openL + 372} ${BOX.floor} Z`}
              fill="#2a3135"
            />
            <rect x={BOX.openL + 316} y={BOX.floor - 28} width="40" height="4" rx="2" fill="#3d464b" />

            {/* pooled light on the floor */}
            <ellipse
              cx={(BOX.openL + BOX.openR) / 2}
              cy={BOX.floor - 4}
              rx={openW / 2.6}
              ry="20"
              fill="#ffffff"
              opacity={lit ? 0.09 : 0.02}
              filter={`url(#${id("soft")})`}
            />
          </g>
        </>
      ) : null}

      {front ? (
        <g clipPath={`url(#${id("bay-clip")})`}>
          {/* ── jets ─────────────────────────────────────────────────── */}
          {washing
            ? NOZZLES.map((x) => (
                <path
                  key={x}
                  d={`M ${x - 4} ${BOX.openTop + 46} L ${x - 30} ${BOX.floor} L ${x + 30} ${BOX.floor} L ${x + 4} ${BOX.openTop + 46} Z`}
                  fill={`url(#${id("jet")})`}
                />
              ))
            : null}

          {/* ── brush columns ────────────────────────────────────────── */}
          {BRUSHES.map((b, k) => (
              <g
                key={k}
                style={{ transition: "transform 800ms cubic-bezier(0.22,1,0.36,1)" }}
                transform={`translate(${washing ? b.close : 0} 0)`}
              >
                {/* bristles sticking out either side */}
                <g stroke="#1c2225" strokeWidth="2.4" strokeLinecap="round" opacity="0.95">
                  {BRISTLES.map((br, n) => {
                    const y = BRUSH_TOP + br.t * (BRUSH_BOTTOM - BRUSH_TOP);
                    return (
                      <g key={n}>
                        <line x1={b.x + 2} y1={y} x2={b.x - br.len} y2={y + br.skew} />
                        <line x1={b.x + BRUSH_W - 2} y1={y} x2={b.x + BRUSH_W + br.len} y2={y + br.skew} />
                      </g>
                    );
                  })}
                </g>
                <rect
                  x={b.x}
                  y={BRUSH_TOP}
                  width={BRUSH_W}
                  height={BRUSH_BOTTOM - BRUSH_TOP}
                  rx={BRUSH_W / 2}
                  fill={`url(#${id("brush")})`}
                />
                <rect
                  x={b.x}
                  y={BRUSH_TOP}
                  width={BRUSH_W}
                  height={BRUSH_BOTTOM - BRUSH_TOP}
                  rx={BRUSH_W / 2}
                  fill={`url(#${id("bristle")})`}
                  opacity="0.55"
                  className={washing ? "brush-run-x" : undefined}
                />
                {/* spindle caps */}
                <rect x={b.x + 6} y={BRUSH_TOP - 12} width={BRUSH_W - 12} height="14" rx="4" fill="#39434a" />
                <rect x={b.x + 6} y={BRUSH_BOTTOM - 2} width={BRUSH_W - 12} height="12" rx="4" fill="#2c3438" />
                {/* wet sheen while it works */}
                {washing ? (
                  <rect
                    x={b.x + 9}
                    y={BRUSH_TOP}
                    width="5"
                    height={BRUSH_BOTTOM - BRUSH_TOP}
                    rx="2.5"
                    fill="var(--color-water)"
                    opacity={0.22 * i}
                  />
                ) : null}
              </g>
          ))}

          {/* spray haze over the whole bay */}
          {washing ? (
            <rect
              x={BOX.openL}
              y={BOX.openTop}
              width={openW}
              height={openH}
              fill="var(--color-water)"
              opacity={0.05 * i}
            />
          ) : null}

          {/* ── water on the inside of the glass ─────────────────────── */}
          <g>
            {STREAKS.map((s, k) => (
              <rect
                key={k}
                x={s.x}
                y={s.top}
                width="2"
                height={s.len}
                rx="1"
                fill="#e9eae5"
                opacity={washing ? s.o + 0.06 * i : s.o}
              />
            ))}
          </g>

          {/* the pane itself */}
          <rect x={BOX.openL} y={BOX.openTop} width={openW} height={openH} rx="12" fill={`url(#${id("glass")})`} />

          {/* ── the door ─────────────────────────────────────────────
               Drawn as a frame with the glazed centre punched out, so the
               pane can be a light tint rather than a second dark layer on
               top of an already dark one. A wash cabinet is glazed for the
               same reason this one is: someone outside has to see what is
               happening in there. */}
          {d > 0.002 ? (
            <g>
              {doorH > 56 ? (
                <>
                  <path
                    fillRule="evenodd"
                    fill={`url(#${id("door")})`}
                    d={`M ${BOX.openL} ${BOX.openTop} H ${BOX.openR} V ${BOX.openTop + doorH} H ${BOX.openL} Z
                        M ${BOX.openL + 30} ${BOX.openTop + 22}
                        H ${BOX.openR - 30} V ${BOX.openTop + doorH - 26} H ${BOX.openL + 30} Z`}
                  />
                  {/* the pane */}
                  <rect
                    x={BOX.openL + 30}
                    y={BOX.openTop + 22}
                    width={openW - 60}
                    height={doorH - 48}
                    fill="#0a1013"
                    opacity="0.2"
                  />
                  <rect
                    x={BOX.openL + 30}
                    y={BOX.openTop + 22}
                    width={openW - 60}
                    height={doorH - 48}
                    fill="var(--color-water)"
                    opacity={washing ? 0.04 + 0.05 * i : 0.02}
                  />
                  {/* reflection across the pane */}
                  <path
                    d={`M ${BOX.openL + 90} ${BOX.openTop + 22} L ${BOX.openL + 30} ${BOX.openTop + doorH - 26} L ${BOX.openL + 96} ${BOX.openTop + doorH - 26} L ${BOX.openL + 156} ${BOX.openTop + 22} Z`}
                    fill="#e9eae5"
                    opacity="0.05"
                  />
                  <rect
                    x={BOX.openL + 30}
                    y={BOX.openTop + 22}
                    width={openW - 60}
                    height={doorH - 48}
                    fill="none"
                    stroke="#e9eae5"
                    strokeOpacity="0.13"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <rect x={BOX.openL} y={BOX.openTop} width={openW} height={doorH} fill={`url(#${id("door")})`} />
              )}

              {/* leading edge */}
              <rect x={BOX.openL} y={BOX.openTop + doorH - 12} width={openW} height="12" fill="#11161a" />
              <rect x={BOX.openL} y={BOX.openTop + doorH - 4.5} width={openW} height="4.5" fill="var(--color-hivis)" opacity="0.95" />
            </g>
          ) : null}
        </g>
      ) : null}

      {front ? (
        <>
          {/* ── the cabinet, as a frame with the bay punched out ─────── */}
          <path
            fillRule="evenodd"
            fill={`url(#${id("cabinet")})`}
            d={`M ${BOX.cabL + BOX.radius} ${BOX.cabT}
                H ${BOX.cabR - BOX.radius} A ${BOX.radius} ${BOX.radius} 0 0 1 ${BOX.cabR} ${BOX.cabT + BOX.radius}
                V ${BOX.cabB - BOX.radius} A ${BOX.radius} ${BOX.radius} 0 0 1 ${BOX.cabR - BOX.radius} ${BOX.cabB}
                H ${BOX.cabL + BOX.radius} A ${BOX.radius} ${BOX.radius} 0 0 1 ${BOX.cabL} ${BOX.cabB - BOX.radius}
                V ${BOX.cabT + BOX.radius} A ${BOX.radius} ${BOX.radius} 0 0 1 ${BOX.cabL + BOX.radius} ${BOX.cabT} Z
                M ${BOX.openL + 12} ${BOX.openTop}
                H ${BOX.openR - 12} A 12 12 0 0 1 ${BOX.openR} ${BOX.openTop + 12}
                V ${BOX.openBottom - 12} A 12 12 0 0 1 ${BOX.openR - 12} ${BOX.openBottom}
                H ${BOX.openL + 12} A 12 12 0 0 1 ${BOX.openL} ${BOX.openBottom - 12}
                V ${BOX.openTop + 12} A 12 12 0 0 1 ${BOX.openL + 12} ${BOX.openTop} Z`}
          />

          {/* top edge highlight and the seam under it */}
          <path
            d={`M ${BOX.cabL + BOX.radius} ${BOX.cabT + 1.5} H ${BOX.cabR - BOX.radius}`}
            stroke="#e9eae5"
            strokeOpacity="0.22"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line x1={BOX.cabL + 14} y1={BOX.openTop - 26} x2={BOX.cabR - 14} y2={BOX.openTop - 26} stroke="#000" strokeOpacity="0.4" strokeWidth="1.5" />

          {/* window reveal: a machined lip around the bay */}
          <rect
            x={BOX.openL - 7}
            y={BOX.openTop - 7}
            width={openW + 14}
            height={openH + 14}
            rx="18"
            fill="none"
            stroke="#6d777d"
            strokeWidth="3"
            opacity="0.8"
          />

          {/* ── wordmark ─────────────────────────────────────────────── */}
          <text
            x={BOX.openL}
            y={BOX.openTop - 52}
            fill="var(--color-concrete)"
            style={{ fontSize: 25, fontWeight: 800, letterSpacing: "0.05em" }}
          >
            MUD
            <tspan fill="var(--color-hivis)">ROOM</tspan>
          </text>

          {/* ── control panel ────────────────────────────────────────── */}
          <ControlPanel washing={washing} intensity={i} />

          {/* ── hi-vis strip along the base ──────────────────────────── */}
          <rect
            x={BOX.cabL + 40}
            y={BOX.cabB - 34}
            width={BOX.cabR - BOX.cabL - 80}
            height="10"
            rx="5"
            fill="var(--color-hivis)"
            opacity="0.22"
            filter={`url(#${id("glow")})`}
          />
          <rect
            x={BOX.cabL + 40}
            y={BOX.cabB - 32}
            width={BOX.cabR - BOX.cabL - 80}
            height="6"
            rx="3"
            fill="var(--color-hivis)"
            opacity={washing ? 1 : 0.82}
          />

          {/* feet */}
          <rect x={BOX.cabL + 46} y={BOX.cabB} width="120" height="10" rx="4" fill="#0a0d0f" />
          <rect x={BOX.cabR - 166} y={BOX.cabB} width="120" height="10" rx="4" fill="#0a0d0f" />

          {/* the light the strip throws on the ground */}
          <ellipse
            cx={BOX.vw / 2}
            cy={BOX.cabB + 26}
            rx="330"
            ry="14"
            fill="var(--color-hivis)"
            opacity="0.1"
            filter={`url(#${id("glow")})`}
          />
        </>
      ) : null}
    </svg>
  );
}

/* ── the panel on the flank of the machine ───────────────────────────── */

function ControlPanel({
  washing,
  intensity,
}: {
  washing: boolean;
  intensity: number;
}) {
  const w = BOX.panR - BOX.panL;
  const padX = BOX.panL + 12;
  const innerW = w - 24;
  /* MUD MODE is the one shown as selected — it is the program the hero
     cycle is running. */
  const selected = 1;

  return (
    <g>
      <rect x={BOX.panL} y={BOX.panT} width={w} height={BOX.panB - BOX.panT} rx="10" fill="#0c1012" />
      <rect
        x={BOX.panL}
        y={BOX.panT}
        width={w}
        height={BOX.panB - BOX.panT}
        rx="10"
        fill="none"
        stroke="#2b3236"
        strokeWidth="2"
      />

      <text x={padX} y={BOX.panT + 30} style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.06em" }} fill="var(--color-concrete)">
        MUD<tspan fill="var(--color-hivis)">ROOM</tspan>
      </text>
      <line x1={padX} y1={BOX.panT + 42} x2={BOX.panR - 12} y2={BOX.panT + 42} stroke="#242b2f" strokeWidth="1.5" />

      <text
        x={padX}
        y={BOX.panT + 62}
        style={{ fontSize: 8.5, letterSpacing: "0.14em" }}
        fill="#e9eae5"
        fillOpacity="0.45"
      >
        CLEANING PROGRAM
      </text>

      {/* the bike on the screen */}
      <rect x={padX} y={BOX.panT + 72} width={innerW} height="46" rx="5" fill="#141a1d" />
      <PanelBike x={BOX.panL + w / 2} y={BOX.panT + 95} />

      {/* program list */}
      {PANEL_PROGRAMS.map((p, k) => {
        const y = BOX.panT + 128 + k * 26;
        const on = k === selected;
        return (
          <g key={p.name}>
            <rect
              x={padX}
              y={y}
              width={innerW}
              height="22"
              rx="3"
              fill={on ? "var(--color-hivis)" : "#161c1f"}
              opacity={on ? 0.16 : 1}
            />
            {on ? (
              <rect x={padX} y={y} width={innerW} height="22" rx="3" fill="none" stroke="var(--color-hivis)" strokeWidth="1.4" strokeOpacity="0.8" />
            ) : null}
            <text
              x={padX + 7}
              y={y + 15}
              style={{ fontSize: 9, letterSpacing: "0.08em" }}
              fill={on ? "var(--color-hivis)" : "#e9eae5"}
              fillOpacity={on ? 1 : 0.55}
            >
              {p.name}
            </text>
            <text
              x={BOX.panR - 19}
              y={y + 15}
              textAnchor="end"
              style={{ fontSize: 8, letterSpacing: "0.06em" }}
              fill={on ? "var(--color-hivis)" : "#e9eae5"}
              fillOpacity={on ? 0.9 : 0.32}
            >
              {p.time}
            </text>
          </g>
        );
      })}

      {/* readouts */}
      {[
        { label: "WATER", value: "34 L" },
        { label: "PRESSURE", value: "55 BAR" },
      ].map((r, k) => (
        <g key={r.label}>
          <rect x={padX + k * (innerW / 2 + 3)} y={BOX.panT + 240} width={innerW / 2 - 3} height="30" rx="3" fill="#161c1f" />
          <text
            x={padX + k * (innerW / 2 + 3) + 6}
            y={BOX.panT + 252}
            style={{ fontSize: 6.5, letterSpacing: "0.12em" }}
            fill="#e9eae5"
            fillOpacity="0.35"
          >
            {r.label}
          </text>
          <text
            x={padX + k * (innerW / 2 + 3) + 6}
            y={BOX.panT + 265}
            style={{ fontSize: 9, letterSpacing: "0.04em" }}
            fill="var(--color-water)"
            fillOpacity="0.9"
          >
            {r.value}
          </text>
        </g>
      ))}

      {/* toggles */}
      {["DRYING", "RECLAIM", "BRUSH", "RINSE"].map((t, k) => {
        const bw = innerW / 4 - 2.5;
        const x = padX + k * (bw + 3.3);
        const active = k < 2 || washing;
        return (
          <g key={t}>
            <rect x={x} y={BOX.panT + 276} width={bw} height="26" rx="3" fill="#161c1f" />
            <text
              x={x + bw / 2}
              y={BOX.panT + 287}
              textAnchor="middle"
              style={{ fontSize: 5.5, letterSpacing: "0.1em" }}
              fill="#e9eae5"
              fillOpacity="0.35"
            >
              {t}
            </text>
            <text
              x={x + bw / 2}
              y={BOX.panT + 297}
              textAnchor="middle"
              style={{ fontSize: 7, letterSpacing: "0.06em" }}
              fill={active ? "var(--color-hivis)" : "#e9eae5"}
              fillOpacity={active ? 0.95 : 0.28}
            >
              {active ? "ON" : "OFF"}
            </text>
          </g>
        );
      })}

      {/* progress while a cycle runs */}
      <rect x={padX} y={BOX.panT + 312} width={innerW} height="4" rx="2" fill="#161c1f" />
      <rect
        x={padX}
        y={BOX.panT + 312}
        width={innerW * (washing ? 0.25 + 0.7 * intensity : 0)}
        height="4"
        rx="2"
        fill="var(--color-water)"
        opacity="0.85"
      />

      {/* start */}
      <rect
        x={padX}
        y={BOX.panT + 328}
        width={innerW}
        height="34"
        rx="4"
        fill="var(--color-hivis)"
        opacity={washing ? 1 : 0.9}
      />
      <text
        x={BOX.panL + w / 2}
        y={BOX.panT + 350}
        textAnchor="middle"
        style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}
        fill="#0d0f11"
      >
        {washing ? "RUNNING" : "START"}
      </text>
    </g>
  );
}

/** The bike glyph on the panel screen. */
function PanelBike({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x - 34} ${y - 11})`}
      stroke="var(--color-hivis)"
      strokeOpacity="0.75"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    >
      <circle cx="12" cy="16" r="10" />
      <circle cx="56" cy="16" r="10" />
      <path d="M12 16 L26 1 L44 1 L56 16 M26 1 L34 16 L56 16 M34 16 L22 4" />
      <path d="M41 -2 L48 -2" />
    </g>
  );
}
