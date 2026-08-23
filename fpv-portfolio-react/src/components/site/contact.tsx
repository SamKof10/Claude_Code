import { BlurFade } from "@/components/ui/blur-fade"
import { buttonVariants } from "@/components/ui/button"

const SOCIALS = [
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="2" y="5.5" width="20" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 9.2v5.6l5-2.8-5-2.8z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M13 3v10.8a3 3 0 1 1-2.2-2.9V8.7A5.2 5.2 0 1 0 15 13.8V9.6a6.4 6.4 0 0 0 4 1.4V8.3A4 4 0 0 1 15.3 4 4 4 0 0 1 15 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1180px] px-5 py-24 text-center sm:px-8">
      <BlurFade inView direction="up">
        <p className="mb-3 font-tech text-[11px] uppercase tracking-[0.14em] text-brand">CH05 — Kontakt</p>
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold uppercase leading-none tracking-tight">
          Nächste Line gemeinsam fliegen?
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-muted-foreground">
          Für Projekte, Kooperationen und Locations — kurz schreiben, Rest klärt sich beim Fliegen.
        </p>
      </BlurFade>

      <BlurFade inView direction="up" delay={0.1}>
        <a
          href="mailto:hello@ghostline.fpv"
          className={buttonVariants({ variant: "default", size: "lg", className: "mt-10 font-tech text-lg tracking-wide" })}
        >
          hello@ghostline.fpv
        </a>
      </BlurFade>

      <BlurFade inView direction="up" delay={0.15}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} className={buttonVariants({ variant: "secondary" })}>
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </BlurFade>
    </section>
  )
}
