import { cn } from "@/components/ui/cn";

/* Deterministic splatter — a Math.random() field would redraw itself on
   every render and tear during hydration. */
function splatter(seed: number, count: number) {
  return Array.from({ length: count }).map((_, k) => {
    const s = (seed * 31 + k * 17) % 97;
    const t = (seed * 13 + k * 29) % 89;
    return {
      x: 6 + (s % 88),
      y: 6 + (t % 88),
      r: 1 + ((s + t) % 7) / 2,
      o: 0.25 + ((s % 6) / 10),
    };
  });
}

const MUD = "#7a5c33";
const MUD_DARK = "#4a3a22";

/**
 * Five abstract vignettes of the mess a bike comes home with. Drawn, not
 * photographed — a stock photo of a dirty bike would look like every other
 * stock photo of a dirty bike.
 */
export function MessArt({ index, className }: { index: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("h-full w-full", className)} aria-hidden>
      <rect width="100" height="100" fill="#121618" />

      {index === 0 ? (
        <>
          {/* wet clay: layered blobs */}
          <ellipse cx="50" cy="66" rx="42" ry="24" fill={MUD_DARK} opacity="0.55" />
          <ellipse cx="42" cy="58" rx="28" ry="18" fill={MUD} opacity="0.5" />
          <ellipse cx="62" cy="70" rx="20" ry="12" fill={MUD} opacity="0.35" />
          {splatter(3, 26).map((d, k) => (
            <circle key={k} cx={d.x} cy={d.y} r={d.r} fill={MUD} opacity={d.o} />
          ))}
        </>
      ) : null}

      {index === 1 ? (
        <>
          {/* tyre: knobs packed solid */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#1e2427" strokeWidth="14" />
          <circle cx="50" cy="50" r="38" fill="none" stroke={MUD} strokeWidth="14" opacity="0.42" strokeDasharray="9 7" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="#2b3236" strokeWidth="2" />
          {Array.from({ length: 24 }).map((_, k) => {
            const a = (k / 24) * Math.PI * 2;
            const x1 = Math.round((50 + Math.cos(a) * 31) * 100) / 100;
            const y1 = Math.round((50 + Math.sin(a) * 31) * 100) / 100;
            const x2 = Math.round((50 + Math.cos(a) * 45) * 100) / 100;
            const y2 = Math.round((50 + Math.sin(a) * 45) * 100) / 100;
            return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#171b1e" strokeWidth="4" />;
          })}
          {splatter(7, 18).map((d, k) => (
            <circle key={k} cx={d.x} cy={d.y} r={d.r * 0.7} fill={MUD} opacity={d.o * 0.8} />
          ))}
        </>
      ) : null}

      {index === 2 ? (
        <>
          {/* drivetrain: chain over a ring */}
          <circle cx="50" cy="50" r="26" fill="none" stroke="#2f373b" strokeWidth="3" />
          {Array.from({ length: 30 }).map((_, k) => {
            const a = (k / 30) * Math.PI * 2;
            const x = Math.round((50 + Math.cos(a) * 26) * 100) / 100;
            const y = Math.round((50 + Math.sin(a) * 26) * 100) / 100;
            return <rect key={k} x={x - 1.4} y={y - 3} width="2.8" height="6" fill="#39424a" />;
          })}
          <circle cx="50" cy="50" r="34" fill="none" stroke="#20262a" strokeWidth="5" strokeDasharray="5 4" />
          <circle cx="50" cy="50" r="34" fill="none" stroke={MUD} strokeWidth="5" strokeDasharray="3 12" opacity="0.5" />
          <circle cx="50" cy="50" r="7" fill="#1a1f22" />
        </>
      ) : null}

      {index === 3 ? (
        <>
          {/* frame tube with splatter along it */}
          <rect x="8" y="44" width="84" height="13" rx="6" transform="rotate(-16 50 50)" fill="#252c31" />
          <rect x="8" y="44" width="84" height="4" rx="2" transform="rotate(-16 50 50)" fill="#3c454a" opacity="0.7" />
          {splatter(11, 34).map((d, k) => (
            <circle key={k} cx={d.x} cy={d.y} r={d.r * 0.85} fill={k % 3 === 0 ? MUD_DARK : MUD} opacity={d.o} />
          ))}
        </>
      ) : null}

      {index === 4 ? (
        <>
          {/* post-race: a rank of bikes */}
          {[10, 32, 54, 76].map((x, k) => (
            <g key={x} stroke={k % 2 ? "#4a5257" : "#39424a"} strokeWidth="2.2" fill="none">
              <circle cx={x} cy="62" r="9" />
              <circle cx={x + 16} cy="62" r="9" />
              <path d={`M${x} 62 L${x + 6} 48 L${x + 13} 48 L${x + 16} 62 M${x + 6} 48 L${x + 9} 62`} />
            </g>
          ))}
          <rect x="0" y="72" width="100" height="28" fill={MUD_DARK} opacity="0.4" />
          {splatter(19, 20).map((d, k) => (
            <circle key={k} cx={d.x} cy={70 + (d.y % 28)} r={d.r * 0.6} fill={MUD} opacity={d.o} />
          ))}
        </>
      ) : null}

      <rect width="100" height="100" fill="url(#none)" />
    </svg>
  );
}
