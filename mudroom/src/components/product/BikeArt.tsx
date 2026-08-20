"use client";

import { useId } from "react";
import { getBike, type BikeId } from "@/lib/bikes";
import { cn } from "@/components/ui/cn";

interface BikeArtProps {
  bikeId: BikeId;
  /** 0 = factory clean, 1 = straight off a wet track. */
  dirt?: number;
  /** Wet look — darker, with a specular sheen. */
  wet?: boolean;
  className?: string;
  title?: string;
}

/* Trig is not bit-identical between Node and V8-in-the-browser: the last
   digit of a spoke coordinate can differ, and React counts that as a
   hydration mismatch. Rounding to 3 decimals is invisible at any size this
   is drawn and makes server and client agree exactly. */
const n = (v: number) => Math.round(v * 1000) / 1000;
const rad = (deg: number) => (deg * Math.PI) / 180;

const GROUND = 250;

/**
 * A bike drawn from its geometry rather than traced. Wheelbase, head angle,
 * seat angle, travel and chainstay ratio place every joint, so the eight
 * types are genuinely different machines rather than one silhouette
 * recoloured — a downhill bike really does sit slacker and longer than a
 * road bike, and you can see it.
 */
export function BikeArt({ bikeId, dirt = 0, wet = false, className, title }: BikeArtProps) {
  const uid = useId().replace(/:/g, "");
  const b = getBike(bikeId);
  const id = (s: string) => `${s}-${uid}`;
  const d = Math.min(1, Math.max(0, dirt));

  /* ── the points every tube hangs off ───────────────────────────────── */
  const rearX = 112;
  const frontX = rearX + b.wheelbase;
  const wheelY = GROUND - b.wheelR;
  const bbX = rearX + b.wheelbase * b.csRatio;
  const bbY = GROUND - b.bbY;

  const hRad = rad(b.headAngle);
  const sRad = rad(b.seatAngle);
  const tanH = Math.tan(hRad);
  const tanS = Math.tan(sRad);

  /* Steering axis: going up the axis moves backwards, by the head angle.
     crownRise is already the vertical component of the axle-to-crown. */
  const crownY = n(wheelY - b.crownRise);
  const crownX = n(frontX - b.crownRise / tanH);
  const headLen = b.bar === "drop" ? 15 : b.bar === "bmx" ? 13 : 18;
  const headBottomX = crownX;
  const headBottomY = crownY;
  const headTopX = n(headBottomX - headLen / tanH);
  const headTopY = n(headBottomY - headLen);

  /* Steerer above the head tube, then the stem forward to the bar. */
  const barYPos = GROUND - b.barY;
  const steerTopY = n(Math.min(headTopY - 5, barYPos + 3));
  const steerTopX = n(headTopX - (headTopY - steerTopY) / tanH);
  const stemLen = b.bar === "drop" ? 20 : 15;
  const barX = n(steerTopX + stemLen);

  /* Seat tube. */
  const seatTopY = GROUND - b.seatY;
  const postLen = b.dropper ? 40 : b.bar === "bmx" ? 18 : 30;
  const seatJunctionY = n(seatTopY + postLen);
  const seatJunctionX = n(bbX - (bbY - seatJunctionY) / tanS);
  const seatTopX = n(bbX - (bbY - seatTopY) / tanS);

  /* Rear suspension, as a readable four-bar: a swingarm pivot above the
     bottom bracket, a rocker on the seat tube with one arm to the shock and
     one to the seat stay, and the shock tucked into the front triangle. */
  const pivotX = n(bbX + 20);
  const pivotY = n(bbY - 14);
  const rockerX = n(seatJunctionX + 3);
  const rockerY = n(seatJunctionY + 13);
  const rockerShockX = n(rockerX + 19);
  const rockerShockY = n(rockerY + 7);
  const rockerStayX = n(rockerX - 5);
  const rockerStayY = n(rockerY + 14);
  const shockLowX = n(bbX + 16);
  const shockLowY = n(bbY - 18);

  /* Where the seat stay lands. */
  const stayTopX = b.fullSus ? rockerStayX : n(seatJunctionX + 2);
  const stayTopY = b.fullSus ? rockerStayY : n(seatJunctionY + 4);

  const frame = wet ? "#22272a" : "#2b3134";
  const frameLight = wet ? "#3d454a" : "#4d565c";
  const frameDark = wet ? "#0f1214" : "#15181b";
  const rubber = wet ? "#0e1012" : "#151719";
  const steel = wet ? "#7b848a" : "#8d969c";

  return (
    <svg
      viewBox="0 0 460 300"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={title ?? `${b.name} bike`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={id("tube")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={frameLight} />
          <stop offset="42%" stopColor={frame} />
          <stop offset="100%" stopColor={frameDark} />
        </linearGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wet ? "#5c646a" : "#6d757b"} />
          <stop offset="55%" stopColor="#333a3e" />
          <stop offset="100%" stopColor="#20262a" />
        </linearGradient>
        <linearGradient id={id("stanchion")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5e666c" />
          <stop offset="40%" stopColor={steel} />
          <stop offset="100%" stopColor="#4a5257" />
        </linearGradient>
        <radialGradient id={id("mud")} cx="50%" cy="52%" r="52%">
          <stop offset="0%" stopColor="#7a5c33" stopOpacity={0.7 * d} />
          <stop offset="100%" stopColor="#4a3a22" stopOpacity={0} />
        </radialGradient>
        <filter id={id("shadow")} x="-30%" y="-60%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* contact shadow */}
      <ellipse cx={n((rearX + frontX) / 2)} cy={GROUND + 5} rx={n(b.wheelbase * 0.6)} ry="6" fill="#000" opacity="0.4" filter={`url(#${id("shadow")})`} />

      {/* ── wheels ───────────────────────────────────────────────────── */}
      <Wheel cx={rearX} cy={wheelY} b={b} rubber={rubber} steel={steel} rimId={id("rim")} rear />
      <Wheel cx={frontX} cy={wheelY} b={b} rubber={rubber} steel={steel} rimId={id("rim")} />

      {/* ── drivetrain behind the frame ──────────────────────────────── */}
      {b.cassetteR > 0 ? (
        <g>
          {/* cassette */}
          {[1, 0.82, 0.64, 0.46].map((f, k) => (
            <circle key={k} cx={rearX} cy={wheelY} r={n(b.cassetteR * f)} fill="none" stroke={k === 0 ? "#5c656b" : "#485055"} strokeWidth="2.2" />
          ))}
          <circle cx={rearX} cy={wheelY} r="5" fill="#3b4348" />
          {/* rear mech */}
          {b.bar !== "bmx" ? (
            <g>
              <path
                d={`M ${n(rearX + 4)} ${n(wheelY + b.cassetteR - 2)} L ${n(rearX + 16)} ${n(wheelY + b.cassetteR + 14)}`}
                stroke={frame}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx={n(rearX + 14)} cy={n(wheelY + b.cassetteR + 12)} r="5.5" fill="#3d454a" stroke="#242a2e" strokeWidth="1.5" />
              <circle cx={n(rearX + 6)} cy={n(wheelY + b.cassetteR + 24)} r="5.5" fill="#3d454a" stroke="#242a2e" strokeWidth="1.5" />
              {/* chain: upper run, lower run, and the loop through the cage */}
              <path
                d={`M ${n(bbX + b.ringR)} ${n(bbY - 1)} L ${n(rearX + b.cassetteR * 0.5)} ${n(wheelY - b.cassetteR * 0.86)}`}
                stroke="#7d868c"
                strokeWidth="2.2"
              />
              <path
                d={`M ${n(bbX + b.ringR - 2)} ${n(bbY + b.ringR - 2)} L ${n(rearX + 14)} ${n(wheelY + b.cassetteR + 7)}`}
                stroke="#6c757b"
                strokeWidth="2.2"
              />
              <path
                d={`M ${n(rearX + 14)} ${n(wheelY + b.cassetteR + 17)} L ${n(rearX + 6)} ${n(wheelY + b.cassetteR + 24)}`}
                stroke="#6c757b"
                strokeWidth="2.2"
              />
            </g>
          ) : (
            <path
              d={`M ${n(bbX + b.ringR)} ${n(bbY - 1)} L ${n(rearX)} ${n(wheelY - b.cassetteR)} M ${n(bbX + b.ringR - 2)} ${n(bbY + b.ringR - 2)} L ${n(rearX)} ${n(wheelY + b.cassetteR)}`}
              stroke="#7d868c"
              strokeWidth="2.2"
            />
          )}
        </g>
      ) : null}

      {/* ── rear triangle ────────────────────────────────────────────── */}
      {/* seat stay */}
      <path
        d={`M ${n(rearX)} ${n(wheelY)} L ${n(stayTopX)} ${n(stayTopY)}`}
        stroke={`url(#${id("tube")})`}
        strokeWidth={b.bar === "drop" ? 6 : 8}
        strokeLinecap="round"
      />
      {/* chain stay */}
      <path
        d={`M ${n(rearX)} ${n(wheelY)} L ${n(b.fullSus ? pivotX : bbX)} ${n(b.fullSus ? pivotY : bbY)}`}
        stroke={`url(#${id("tube")})`}
        strokeWidth={b.bar === "drop" ? 7 : 10}
        strokeLinecap="round"
      />
      {b.fullSus ? (
        <path d={`M ${n(pivotX)} ${n(pivotY)} L ${n(bbX)} ${n(bbY)}`} stroke={frame} strokeWidth="9" strokeLinecap="round" />
      ) : null}

      {/* rear caliper */}
      {b.rotorR > 0 ? (
        <rect x={n(rearX + 2)} y={n(wheelY - b.rotorR - 4)} width="9" height="14" rx="2.5" fill="#394146" transform={`rotate(-24 ${n(rearX + 6)} ${n(wheelY - b.rotorR)})`} />
      ) : null}

      {/* ── main triangle ────────────────────────────────────────────── */}
      {/* down tube */}
      <path
        d={`M ${n(bbX)} ${n(bbY)} L ${n(headBottomX)} ${n(headBottomY + 2)}`}
        stroke={`url(#${id("tube")})`}
        strokeWidth={b.bar === "drop" ? 10 : b.battery ? 17 : 13}
        strokeLinecap="round"
      />
      {/* seat tube */}
      <path
        d={`M ${n(bbX)} ${n(bbY)} L ${n(seatJunctionX)} ${n(seatJunctionY)}`}
        stroke={`url(#${id("tube")})`}
        strokeWidth={b.bar === "drop" ? 8 : 11}
        strokeLinecap="round"
      />
      {/* top tube */}
      <path
        d={`M ${n(seatJunctionX)} ${n(seatJunctionY + 2)} L ${n(headTopX + 2)} ${n(headTopY + 5)}`}
        stroke={`url(#${id("tube")})`}
        strokeWidth={b.bar === "drop" ? 8 : 10}
        strokeLinecap="round"
      />
      {/* head tube */}
      <path
        d={`M ${n(headBottomX)} ${n(headBottomY)} L ${n(headTopX)} ${n(headTopY)}`}
        stroke={frameLight}
        strokeWidth={b.bar === "drop" ? 10 : 12}
        strokeLinecap="round"
      />

      {/* ── rocker and shock ────────────────────────────────────────── */}
      {b.fullSus ? (
        <g>
          <path
            d={`M ${n(rockerStayX)} ${n(rockerStayY)} L ${n(rockerX)} ${n(rockerY)} L ${n(rockerShockX)} ${n(rockerShockY)} Z`}
            fill={frameLight}
            stroke={frameLight}
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path
            d={`M ${n(shockLowX)} ${n(shockLowY)} L ${n(rockerShockX)} ${n(rockerShockY)}`}
            stroke={steel}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d={`M ${n(shockLowX + (rockerShockX - shockLowX) * 0.08)} ${n(shockLowY + (rockerShockY - shockLowY) * 0.08)}
                L ${n(shockLowX + (rockerShockX - shockLowX) * 0.58)} ${n(shockLowY + (rockerShockY - shockLowY) * 0.58)}`}
            stroke="#2c3337"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx={n(rockerX)} cy={n(rockerY)} r="3.2" fill="#171b1e" />
          <circle cx={n(rockerShockX)} cy={n(rockerShockY)} r="2.8" fill="#171b1e" />
          <circle cx={n(shockLowX)} cy={n(shockLowY)} r="3" fill="#171b1e" />
          <circle cx={n(pivotX)} cy={n(pivotY)} r="3.4" fill="#171b1e" />
        </g>
      ) : null}

      {/* ── e-bike motor and battery ─────────────────────────────────── */}
      {b.battery ? (
        <g>
          <path
            d={`M ${n(bbX + 4)} ${n(bbY + 2)} L ${n(headBottomX + 8)} ${n(headBottomY + 12)}`}
            stroke="#232a2e"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <ellipse cx={n(bbX - 2)} cy={n(bbY + 2)} rx="17" ry="14" fill="#2e363b" />
          <circle cx={n(bbX - 8)} cy={n(bbY - 4)} r="2.4" fill="var(--color-hivis)" opacity="0.7" />
        </g>
      ) : null}

      {/* ── chainring, cranks, pedals ────────────────────────────────── */}
      <g>
        <circle cx={n(bbX)} cy={n(bbY)} r={b.ringR} fill="none" stroke="#6f787e" strokeWidth="2.6" />
        {Array.from({ length: 22 }).map((_, k) => {
          const a = (k / 22) * Math.PI * 2;
          return (
            <line
              key={k}
              x1={n(bbX + Math.cos(a) * b.ringR)}
              y1={n(bbY + Math.sin(a) * b.ringR)}
              x2={n(bbX + Math.cos(a) * (b.ringR + 2.6))}
              y2={n(bbY + Math.sin(a) * (b.ringR + 2.6))}
              stroke="#6f787e"
              strokeWidth="1.6"
            />
          );
        })}
        {/* far crank, then the near one */}
        <path d={`M ${n(bbX)} ${n(bbY)} L ${n(bbX - 11)} ${n(bbY + 27)}`} stroke="#20262a" strokeWidth="5.5" strokeLinecap="round" />
        <rect x={n(bbX - 19)} y={n(bbY + 25)} width="16" height="4.5" rx="1.5" fill="#20262a" />
        <path d={`M ${n(bbX)} ${n(bbY)} L ${n(bbX + 14)} ${n(bbY - 25)}`} stroke="#59636a" strokeWidth="6.5" strokeLinecap="round" />
        <rect x={n(bbX + 7)} y={n(bbY - 29)} width="17" height="5" rx="1.5" fill="#5c666c" />
        <circle cx={n(bbX)} cy={n(bbY)} r="4.5" fill="#4c555b" />
      </g>

      {/* ── fork ─────────────────────────────────────────────────────── */}
      <g>
        {b.travel > 0 ? (
          <>
            {/* lowers */}
            <path
              d={`M ${n(crownX + (frontX - crownX) * 0.42)} ${n(crownY + (wheelY - crownY) * 0.42)} L ${n(frontX)} ${n(wheelY)}`}
              stroke={frame}
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* stanchion */}
            <path
              d={`M ${n(crownX)} ${n(crownY)} L ${n(crownX + (frontX - crownX) * 0.5)} ${n(crownY + (wheelY - crownY) * 0.5)}`}
              stroke={`url(#${id("stanchion")})`}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* crown */}
            <rect
              x={n(crownX - 11)}
              y={n(crownY - 5)}
              width="22"
              height="11"
              rx="3"
              fill={frameLight}
              transform={`rotate(${n(90 - b.headAngle)} ${n(crownX)} ${n(crownY)})`}
            />
            {b.dualCrown ? (
              <rect
                x={n(headTopX - 12)}
                y={n(headTopY - 8)}
                width="24"
                height="10"
                rx="3"
                fill={frameLight}
                transform={`rotate(${n(90 - b.headAngle)} ${n(headTopX)} ${n(headTopY)})`}
              />
            ) : null}
          </>
        ) : (
          /* rigid blade, with the gentle forward curve a road fork has */
          <path
            d={`M ${n(crownX)} ${n(crownY)} Q ${n(crownX + (frontX - crownX) * 0.35)} ${n(crownY + (wheelY - crownY) * 0.62)} ${n(frontX)} ${n(wheelY)}`}
            stroke={`url(#${id("tube")})`}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {/* front caliper */}
        {b.rotorR > 0 ? (
          <rect
            x={n(frontX - 14)}
            y={n(wheelY - b.rotorR - 6)}
            width="9"
            height="15"
            rx="2.5"
            fill="#394146"
            transform={`rotate(18 ${n(frontX - 10)} ${n(wheelY - b.rotorR)})`}
          />
        ) : null}
      </g>

      {/* ── steerer, stem, bar ───────────────────────────────────────── */}
      <g>
        <path d={`M ${n(headTopX)} ${n(headTopY)} L ${n(steerTopX)} ${n(barYPos + 4)}`} stroke="#394146" strokeWidth="8" strokeLinecap="round" />
        <path d={`M ${n(steerTopX)} ${n(barYPos + 4)} L ${n(barX)} ${n(barYPos)}`} stroke={frameLight} strokeWidth="9" strokeLinecap="round" />

        {b.bar === "drop" ? (
          <g fill="none" stroke={frameLight} strokeWidth="6" strokeLinecap="round">
            <path
              d={`M ${n(barX)} ${n(barYPos)}
                  C ${n(barX + 15)} ${n(barYPos - 4)} ${n(barX + 19)} ${n(barYPos + 9)} ${n(barX + 9)} ${n(barYPos + 17)}
                  C ${n(barX + 1)} ${n(barYPos + 24)} ${n(barX - 9)} ${n(barYPos + 22)} ${n(barX - 12)} ${n(barYPos + 14)}`}
            />
            {/* hoods */}
            <path d={`M ${n(barX + 12)} ${n(barYPos - 2)} L ${n(barX + 24)} ${n(barYPos + 3)}`} stroke="#1d2225" strokeWidth="8" />
          </g>
        ) : null}

        {b.bar === "bmx" ? (
          <g stroke={frameLight} strokeWidth="7" strokeLinecap="round" fill="none">
            <path d={`M ${n(barX - 4)} ${n(barYPos)} L ${n(barX - 2)} ${n(barYPos - 26)}`} />
            <path d={`M ${n(barX - 12)} ${n(barYPos - 13)} L ${n(barX + 8)} ${n(barYPos - 13)}`} strokeWidth="4" />
            <circle cx={n(barX - 2)} cy={n(barYPos - 28)} r="5" fill="#1d2225" stroke="none" />
          </g>
        ) : null}

        {(b.bar === "riser" || b.bar === "flat") && (
          <g>
            {b.bar === "riser" ? (
              <path d={`M ${n(barX - 3)} ${n(barYPos + 2)} L ${n(barX + 2)} ${n(barYPos - 9)}`} stroke={frameLight} strokeWidth="7" strokeLinecap="round" />
            ) : null}
            {/* the grip, seen almost end-on */}
            <ellipse cx={n(barX + 3)} cy={n(barYPos - (b.bar === "riser" ? 10 : 1))} rx="6.5" ry="8" fill="#1d2225" />
            {/* brake lever reaching forward */}
            <path
              d={`M ${n(barX + 6)} ${n(barYPos - (b.bar === "riser" ? 12 : 3))} q 14 2 17 9`}
              stroke="#5d666c"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>

      {/* ── post and saddle ──────────────────────────────────────────── */}
      <g>
        {b.dropper ? (
          <>
            <path d={`M ${n(seatJunctionX)} ${n(seatJunctionY)} L ${n(seatTopX + (bbX - seatTopX) * 0.35)} ${n(seatTopY + postLen * 0.35)}`} stroke="#3c454a" strokeWidth="9" strokeLinecap="round" />
            <path d={`M ${n(seatTopX + (bbX - seatTopX) * 0.35)} ${n(seatTopY + postLen * 0.35)} L ${n(seatTopX)} ${n(seatTopY)}`} stroke={steel} strokeWidth="7.5" strokeLinecap="round" />
          </>
        ) : (
          <path d={`M ${n(seatJunctionX)} ${n(seatJunctionY)} L ${n(seatTopX)} ${n(seatTopY)}`} stroke="#3c454a" strokeWidth="7.5" strokeLinecap="round" />
        )}
        {/* saddle: pointed nose forward, rounded tail */}
        <path
          d={`M ${n(seatTopX + 26)} ${n(seatTopY - 3)}
              C ${n(seatTopX + 12)} ${n(seatTopY - 7)} ${n(seatTopX - 6)} ${n(seatTopY - 9)} ${n(seatTopX - 17)} ${n(seatTopY - 6)}
              C ${n(seatTopX - 24)} ${n(seatTopY - 4)} ${n(seatTopX - 22)} ${n(seatTopY + 3)} ${n(seatTopX - 13)} ${n(seatTopY + 2)}
              C ${n(seatTopX - 2)} ${n(seatTopY + 1)} ${n(seatTopX + 14)} ${n(seatTopY + 1)} ${n(seatTopX + 26)} ${n(seatTopY - 3)} Z`}
          fill="#1c2124"
        />
        <path
          d={`M ${n(seatTopX + 24)} ${n(seatTopY - 4)} C ${n(seatTopX + 6)} ${n(seatTopY - 8)} ${n(seatTopX - 8)} ${n(seatTopY - 9)} ${n(seatTopX - 16)} ${n(seatTopY - 6)}`}
          stroke="#454e54"
          strokeWidth="1.6"
          fill="none"
        />
      </g>

      {/* ── dirt ─────────────────────────────────────────────────────── */}
      {d > 0.02 ? (
        <g>
          {/* mud caked into the tread, in patches rather than a halo */}
          {[rearX, frontX].map((cx, i) => (
            <g key={i}>
              <circle
                cx={cx}
                cy={wheelY}
                r={n(b.wheelR - b.tyre * 0.6)}
                fill="none"
                stroke="#6b5028"
                strokeWidth={n(b.tyre * 1.9)}
                strokeDasharray={i === 0 ? "16 11 7 14" : "11 9 19 12"}
                opacity={0.5 * d}
              />
              <circle
                cx={cx}
                cy={wheelY}
                r={n(b.wheelR - b.tyre * 1.4)}
                fill="none"
                stroke="#4a3a22"
                strokeWidth={n(b.tyre * 0.9)}
                strokeDasharray={i === 0 ? "9 21" : "13 17"}
                opacity={0.45 * d}
              />
            </g>
          ))}
          {/* splatter up the down tube and along the stays */}
          {Array.from({ length: 40 }).map((_, k) => {
            const t = (k % 20) / 19;
            const along = k % 2 === 0;
            const x = along ? bbX + (headBottomX - bbX) * t : rearX + (bbX - rearX) * t;
            const y = along ? bbY + (headBottomY - bbY) * t : wheelY + (bbY - wheelY) * t;
            const seed = (k * 37) % 11;
            return (
              <circle
                key={k}
                cx={n(x + (seed - 5))}
                cy={n(y + ((seed * 3) % 9) - 4)}
                r={n(1.6 + (seed % 4) * 1.1 * d)}
                fill={k % 3 === 0 ? "#4a3a22" : "#7a5c33"}
                opacity={0.3 + 0.55 * d}
              />
            );
          })}
          <ellipse
            cx={n((rearX + frontX) / 2)}
            cy={n(wheelY + 6)}
            rx={n(b.wheelbase * 0.6)}
            ry={n(b.wheelR * 0.7)}
            fill={`url(#${id("mud")})`}
          />
        </g>
      ) : null}

      {/* wet sheen */}
      {wet ? (
        <g opacity="0.55">
          {[rearX, frontX].map((cx, i) => (
            <path
              key={i}
              d={`M ${n(cx - b.wheelR * 0.6)} ${n(wheelY - b.wheelR * 0.6)} a ${b.wheelR} ${b.wheelR} 0 0 1 ${n(b.wheelR * 0.8)} ${n(-b.wheelR * 0.12)}`}
              fill="none"
              stroke="var(--color-water)"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}
          <path
            d={`M ${n(bbX + 6)} ${n(bbY - 8)} L ${n(headBottomX - 6)} ${n(headBottomY + 2)}`}
            stroke="var(--color-water)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>
      ) : null}
    </svg>
  );
}

/* ── one wheel: tyre, knobs, rim, spokes, hub, rotor ─────────────────── */

function Wheel({
  cx,
  cy,
  b,
  rubber,
  steel,
  rimId,
  rear = false,
}: {
  cx: number;
  cy: number;
  b: ReturnType<typeof getBike>;
  rubber: string;
  steel: string;
  rimId: string;
  /** The drive side hides most of the rear rotor behind the cassette. */
  rear?: boolean;
}) {
  const rimR = b.wheelR - b.tyre * 2 - 1;
  const hubR = Math.max(6, b.wheelR * 0.13);
  const spokes = b.wheelR > 50 ? 24 : 18;
  const knobs = b.knob > 0 ? (b.wheelR > 50 ? 38 : 28) : 0;

  return (
    <g>
      {/* tyre carcass */}
      <circle cx={cx} cy={cy} r={n(b.wheelR - b.tyre)} fill="none" stroke={rubber} strokeWidth={n(b.tyre * 2)} />
      {/* knobs */}
      {Array.from({ length: knobs }).map((_, k) => {
        const a = (k / knobs) * Math.PI * 2;
        const outer = b.wheelR + (k % 2 === 0 ? b.knob : b.knob * 0.6);
        return (
          <line
            key={k}
            x1={n(cx + Math.cos(a) * (b.wheelR - b.tyre * 0.5))}
            y1={n(cy + Math.sin(a) * (b.wheelR - b.tyre * 0.5))}
            x2={n(cx + Math.cos(a) * outer)}
            y2={n(cy + Math.sin(a) * outer)}
            stroke={rubber}
            strokeWidth={n(Math.max(2.6, (2 * Math.PI * b.wheelR) / knobs / 2.1))}
            strokeLinecap="butt"
          />
        );
      })}
      {/* rim */}
      <circle cx={cx} cy={cy} r={n(rimR)} fill="none" stroke={`url(#${rimId})`} strokeWidth="7" />
      <circle cx={cx} cy={cy} r={n(rimR + 3)} fill="none" stroke="#7c848a" strokeWidth="1" opacity="0.5" />
      {/* spokes, laced tangentially off the hub flange */}
      {Array.from({ length: spokes }).map((_, k) => {
        const a = (k / spokes) * Math.PI * 2;
        const lace = k % 2 === 0 ? 0.5 : -0.5;
        return (
          <line
            key={k}
            x1={n(cx + Math.cos(a + lace) * hubR)}
            y1={n(cy + Math.sin(a + lace) * hubR)}
            x2={n(cx + Math.cos(a) * (rimR - 3))}
            y2={n(cy + Math.sin(a) * (rimR - 3))}
            stroke="#79828a"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      })}
      {/* rotor */}
      {b.rotorR > 0 ? (
        <g opacity={rear ? 0.32 : 1}>
          <circle cx={cx} cy={cy} r={b.rotorR} fill="none" stroke={steel} strokeWidth="3" opacity="0.9" />
          <circle cx={cx} cy={cy} r={n(b.rotorR - 4)} fill="none" stroke={steel} strokeWidth="1.2" strokeDasharray="4 5" opacity="0.65" />
          <circle cx={cx} cy={cy} r={n(b.rotorR * 0.45)} fill="none" stroke={steel} strokeWidth="2" opacity="0.5" />
        </g>
      ) : null}
      {/* hub */}
      <circle cx={cx} cy={cy} r={n(hubR)} fill="#394146" />
      <circle cx={cx} cy={cy} r={n(hubR * 0.45)} fill="#1b1f22" />
    </g>
  );
}
