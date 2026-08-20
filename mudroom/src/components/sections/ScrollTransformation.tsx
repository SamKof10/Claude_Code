"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { BikeArt } from "@/components/product/BikeArt";
import { Mono, SectionMarker } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* Deterministic spray, so the boundary looks the same on every render. */
const SPRAY = Array.from({ length: 16 }).map((_, k) => {
  const seed = (k * 37) % 100;
  return { y: 8 + (seed % 78), len: 18 + (seed % 26), o: 0.25 + ((seed % 5) / 10), d: (seed % 7) / 9 };
});

/**
 * The wipe, not a crossfade: a clean bike sits under a dirty one and the
 * clean copy is revealed left-to-right by a clip inset, with the brush
 * riding the boundary. Two copies of the same SVG, one clip, no video.
 */
export function ScrollTransformation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const stepped = Math.round(clamp01(value) * 100) / 100;
    setP((cur) => (cur === stepped ? cur : stepped));
  });

  // hold at each end so the "before" and "after" both get a beat
  const wipe = clamp01((p - 0.16) / 0.62);
  const running = wipe > 0.02 && wipe < 0.99;

  return (
    <section ref={ref} className="relative h-[260vh] bg-[#0a0c0d]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-5 sm:px-8">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="flex items-start justify-between gap-6">
            <SectionMarker number="04" label="The point" />
            <Mono className="tnum text-concrete/30">
              Dirt removed {String(Math.round(wipe * 100)).padStart(3, "0")}%
            </Mono>
          </div>

          {/* headlines */}
          <div className="relative mt-6 h-[clamp(2.6rem,7vw,5rem)]">
            <h2
              className="display absolute inset-0 text-[clamp(2.2rem,6.4vw,4.6rem)] text-mud"
              style={{ opacity: 1 - clamp01(wipe / 0.5) }}
            >
              From this…
            </h2>
            <h2
              className="display absolute inset-0 text-right text-[clamp(2.2rem,6.4vw,4.6rem)] text-hivis"
              style={{ opacity: clamp01((wipe - 0.45) / 0.4) }}
            >
              …to this.
            </h2>
          </div>

          {/* the stage */}
          <div className="relative mt-6 overflow-hidden rounded-[6px] border border-[var(--edge)] bg-steel-2">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(80% 70% at 50% 100%, #1c2226 0%, #0f1315 70%)",
              }}
            />

            <div className="relative mx-auto w-full max-w-[560px] px-4 py-6 sm:max-w-[640px]">
              {/* dirty original */}
              <BikeArt bikeId="mtb" dirt={1} wet={false} />

              {/* clean copy, revealed by the wipe */}
              <div
                className="absolute inset-0 px-4 py-6"
                style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}
              >
                <BikeArt bikeId="mtb" dirt={0} wet={wipe < 0.97} />
              </div>

              {/* the brush riding the boundary */}
              {running ? (
                <div
                  className="pointer-events-none absolute top-[12%] bottom-[10%]"
                  style={{ left: `${wipe * 100}%`, width: 32, transform: "translateX(-50%)" }}
                >
                  <div className="brush-cyl h-full w-[32px] rounded-full shadow-[0_0_30px_rgba(127,212,232,0.28)]" />
                  {/* spray thrown off the boundary */}
                  <div className="absolute inset-y-0 left-full w-24">
                    {SPRAY.map((s, k) => (
                      <span
                        key={k}
                        className="absolute h-px rounded-full bg-water"
                        style={
                          {
                            top: `${s.y}%`,
                            left: 0,
                            width: s.len,
                            opacity: s.o,
                            transform: `translateX(${s.d * 26}px)`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* labels under the stage */}
            <div className="relative flex items-center justify-between border-t border-[var(--edge)] px-6 py-3 sm:px-14">
              <Mono className={cn("transition-colors", wipe < 0.5 ? "text-mud" : "text-concrete/25")}>
                Post-race MTB
              </Mono>
              <div className="mx-6 h-px flex-1 bg-[var(--edge)]">
                <div className="h-px bg-hivis" style={{ width: `${wipe * 100}%` }} />
              </div>
              <Mono className={cn("transition-colors", wipe > 0.5 ? "text-hivis" : "text-concrete/25")}>
                Ready to ride
              </Mono>
            </div>
          </div>

          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-concrete/45">
            Four minutes, hands in your pockets. No bucket, no brush, no cold
            water running down your sleeve, no black puddle on the drive.
          </p>
        </div>
      </div>
    </section>
  );
}
