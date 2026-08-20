"use client";

import { motion } from "motion/react";
import { chartKelvinCss } from "@/lib/format";
import { Mono } from "@/components/ui/Primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 01 — the schedule, as a 24-band strip. */
export function SolarVisual() {
  const bands = Array.from({ length: 34 }, (_, i) => {
    const t = i / 33;
    const k = 1800 + Math.sin(Math.PI * Math.pow(t, 0.92)) * 4700;
    return { t, k };
  });

  return (
    <div className="flex h-full flex-col justify-center gap-5 p-7 sm:p-9">
      <div className="flex items-end gap-[3px]" style={{ height: 190 }}>
        {bands.map((b, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-[2px]"
            style={{ background: chartKelvinCss(b.k) }}
            initial={{ height: "12%", opacity: 0 }}
            whileInView={{
              height: `${28 + ((b.k - 1800) / 4700) * 72}%`,
              opacity: 1,
            }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.016, ease: EASE }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Mono className="text-ink-3">06:00</Mono>
        <Mono className="text-ink-3">14:00</Mono>
        <Mono className="text-ink-3">23:00</Mono>
      </div>
    </div>
  );
}

/** 02 — the five emitters, and what each contributes. */
export function SpectrumVisual() {
  const channels = [
    { name: "Weiß kalt", color: "#dce9fb", level: 0.82 },
    { name: "Weiß warm", color: "#ffe0b4", level: 0.94 },
    { name: "Amber", color: "#e8a33d", level: 0.66 },
    { name: "Tiefrot", color: "#b8442f", level: 0.38 },
    { name: "Cyan", color: "#6fc6c9", level: 0.24 },
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-7 sm:p-9">
      {channels.map((c, i) => (
        <div key={c.name} className="flex items-center gap-4">
          <Mono className="w-[92px] shrink-0 whitespace-nowrap text-ink-3">{c.name}</Mono>
          <div
            className="relative h-[7px] flex-1 overflow-hidden rounded-full"
            style={{ background: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }}
          >
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: c.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${c.level * 100}%` }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.85, delay: 0.1 + i * 0.09, ease: EASE }}
            />
          </div>
          <span className="w-9 shrink-0 text-right font-mono text-[11px] text-ink-3 tabular-nums">
            {Math.round(c.level * 100)}
          </span>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
        <span className="h-2.5 w-2.5 rounded-full bg-ember" />
        <Mono className="text-ink-2">Mischung bei 3400 K · CRI 97</Mono>
      </div>
    </div>
  );
}

/** 03 — the asymmetric throw and its hard cut-off. */
export function OpticsVisual() {
  return (
    <div className="grid h-full place-items-center p-7 sm:p-9">
      <svg viewBox="0 0 320 200" className="w-full max-w-[340px]" role="img" aria-label="Abstrahlwinkel mit 65-Grad-Abschnitt">
        <defs>
          <linearGradient id="optics-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ember)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* forbidden zone — light that would reach the eye */}
        <path d="M160 40 L 40 40 L 40 8 L 280 8 L 280 40 Z" fill="none" />
        <motion.path
          d="M160 44 L 44 12 L 276 12 Z"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
          strokeDasharray="3 4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <motion.text
          x="160"
          y="26"
          textAnchor="middle"
          className="fill-ink-3 font-mono"
          style={{ fontSize: 9, letterSpacing: "0.1em" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          ABGESCHNITTEN ÜBER 65°
        </motion.text>

        {/* the lamp head */}
        <rect x="120" y="40" width="80" height="9" rx="4.5" fill="var(--color-ink)" />
        <rect x="126" y="47" width="68" height="3.5" rx="1.75" fill="var(--color-ember)" />

        {/* the beam that is allowed */}
        <motion.path
          d="M126 52 L 194 52 L 296 168 L 24 168 Z"
          fill="url(#optics-beam)"
          initial={{ opacity: 0, scaleY: 0.7 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ transformOrigin: "160px 52px" }}
        />

        {/* desk */}
        <line x1="12" y1="168" x2="308" y2="168" stroke="var(--color-ink)" strokeWidth="1.5" />
        <motion.ellipse
          cx="160"
          cy="168"
          rx="134"
          ry="7"
          fill="var(--color-ember)"
          opacity="0.3"
          initial={{ scaleX: 0.4, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.3 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          style={{ transformOrigin: "160px 168px" }}
        />
        <text x="160" y="188" textAnchor="middle" className="fill-ink-3 font-mono" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
          GLEICHMÄSSIGKEIT 0,8
        </text>
      </svg>
    </div>
  );
}

/** 04 — the dial itself. */
export function DialVisual() {
  return (
    <div className="grid h-full place-items-center p-7 sm:p-9">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full max-w-[210px]"
        role="img"
        aria-label="Das gefräste Bedienrad"
        initial={{ rotate: -22, opacity: 0 }}
        whileInView={{ rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <defs>
          <radialGradient id="dial-face" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#5c5c62" />
            <stop offset="52%" stopColor="#3a3a3e" />
            <stop offset="100%" stopColor="#242427" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="82" fill="var(--color-ember)" opacity="0.09" />
        <circle cx="100" cy="100" r="70" fill="url(#dial-face)" />
        {/* knurling */}
        {Array.from({ length: 72 }).map((_, i) => {
          const a = (i / 72) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 64}
              y1={100 + Math.sin(a) * 64}
              x2={100 + Math.cos(a) * 70}
              y2={100 + Math.sin(a) * 70}
              stroke="#1b1b1e"
              strokeWidth="1.4"
              opacity="0.55"
            />
          );
        })}
        <circle cx="100" cy="100" r="46" fill="none" stroke="#5c5c62" strokeWidth="0.8" opacity="0.5" />
        <circle cx="100" cy="100" r="20" fill="#2a2a2d" />
        {/* index, lit */}
        <circle cx="100" cy="42" r="4" fill="var(--color-ember)" />
        <circle cx="100" cy="42" r="9" fill="var(--color-ember)" opacity="0.28" />
      </motion.svg>
    </div>
  );
}
