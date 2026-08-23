import { useEffect, useState } from "react"

import { NumberTicker } from "@/components/ui/number-ticker"
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "#reel", label: "Reel" },
  { href: "#log", label: "Flight Log" },
  { href: "#rig", label: "Rig" },
  { href: "#pilot", label: "Pilot" },
  { href: "#contact", label: "Kontakt" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-100 flex items-center justify-between px-5 py-4 transition-colors duration-300 sm:px-8",
        scrolled
          ? "border-b border-line-soft bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-background/90 to-transparent"
      )}
    >
      <a href="#top" className="flex items-center gap-2 font-tech text-sm font-semibold tracking-wide text-foreground">
        <svg viewBox="0 0 32 32" width="22" height="22" className="shrink-0 text-brand" aria-hidden="true">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="16" r="2.2" fill="currentColor" />
          <line x1="16" y1="2" x2="16" y2="7" stroke="currentColor" strokeWidth="1.6" />
          <line x1="16" y1="25" x2="16" y2="30" stroke="currentColor" strokeWidth="1.6" />
          <line x1="2" y1="16" x2="7" y2="16" stroke="currentColor" strokeWidth="1.6" />
          <line x1="25" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span>
          GHOST LINE<em className="ml-1 text-brand not-italic">FPV</em>
        </span>
      </a>

      <nav className="hidden items-center gap-7 font-tech text-sm tracking-wide md:flex">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="group relative py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {l.label}
            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-200 group-hover:scale-x-100" />
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-2 font-tech text-[11px] tracking-wide text-muted-foreground md:flex">
        <GlowingBadge variant="error" pulse dot className="font-tech tracking-wide">
          REC
        </GlowingBadge>
        <span className="tabular-nums text-foreground">
          {mm < 10 ? "0" : ""}
          <NumberTicker value={mm} className="text-foreground" />
          :{ss < 10 ? "0" : ""}
          <NumberTicker value={ss} className="text-foreground" />
        </span>
      </div>

      <button
        type="button"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col gap-1.5 p-2 md:hidden"
      >
        <span className={cn("h-0.5 w-5 bg-foreground transition-transform", open && "translate-y-2 rotate-45")} />
        <span className={cn("h-0.5 w-5 bg-foreground transition-opacity", open && "opacity-0")} />
        <span className={cn("h-0.5 w-5 bg-foreground transition-transform", open && "-translate-y-2 -rotate-45")} />
      </button>

      <nav
        className={cn(
          "fixed inset-y-0 right-0 flex w-[min(78vw,320px)] flex-col items-start justify-center gap-6 border-l border-line-soft bg-[#0d1317] px-8 py-20 font-tech text-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
