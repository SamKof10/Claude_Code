import { useEffect, useState } from "react"

import { ScrambleText } from "@/components/unlumen-ui/scramble-text"

export function BootScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const [skip] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)

  useEffect(() => {
    if (skip) {
      setVisible(false)
      return
    }
    const fadeTimer = setTimeout(() => setFading(true), 950)
    const removeTimer = setTimeout(() => setVisible(false), 1350)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [skip])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-300 flex flex-col items-center justify-center gap-3 bg-[#05070a] font-tech tracking-[0.12em] text-brand transition-opacity duration-400 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <p className="text-sm uppercase">
        <ScrambleText text="Acquiring Signal..." scrambleSpeed={35} />
      </p>
      <div className="h-0.5 w-45 overflow-hidden bg-line-soft">
        <div className="h-full w-full origin-left scale-x-0 animate-[boot-fill_0.85s_cubic-bezier(0.22,0.7,0.2,1)_forwards] bg-brand" />
      </div>
    </div>
  )
}
