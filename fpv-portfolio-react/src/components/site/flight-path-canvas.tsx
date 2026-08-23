import { useEffect, useRef } from "react"

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return function next() {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface Point {
  x: number
  y: number
}

function generatePathPoints(width: number, height: number, seed: number, count: number): Point[] {
  const rand = seededRandom(seed)
  const pad = height * 0.18
  const points: Point[] = []
  for (let i = 0; i <= count; i++) {
    points.push({
      x: (width / count) * i,
      y: pad + rand() * (height - pad * 2),
    })
  }
  return points
}

function tracePath(ctx: CanvasRenderingContext2D, points: Point[], fraction = 1): Point {
  const totalSegs = points.length - 1
  const segFloat = totalSegs * fraction
  const fullSegs = Math.floor(segFloat)
  const partial = segFloat - fullSegs

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i <= fullSegs && i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const mx = (p0.x + p1.x) / 2
    const my = (p0.y + p1.y) / 2
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my)
    ctx.lineTo(p1.x, p1.y)
  }
  if (fullSegs < totalSegs && partial > 0) {
    const a = points[fullSegs]
    const b = points[fullSegs + 1]
    ctx.lineTo(a.x + (b.x - a.x) * partial, a.y + (b.y - a.y) * partial)
  }
  ctx.stroke()

  return fullSegs < totalSegs
    ? {
        x: points[fullSegs].x + (points[fullSegs + 1].x - points[fullSegs].x) * partial,
        y: points[fullSegs].y + (points[fullSegs + 1].y - points[fullSegs].y) * partial,
      }
    : points[points.length - 1]
}

function pointAtFraction(points: Point[], t: number): Point {
  const totalSegs = points.length - 1
  const segFloat = totalSegs * t
  const i = Math.min(Math.floor(segFloat), totalSegs - 1)
  const local = segFloat - i
  const a = points[i]
  const b = points[i + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  const step = Math.max(28, width / 12)
  for (let x = step; x < width; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvas.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext("2d")!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, width: w, height: h }
}

interface FlightPathCanvasProps {
  seed: number
  className?: string
  /** hero/reel get the larger animated variant; log cards get a static thumbnail */
  variant?: "thumb" | "animated"
}

export function FlightPathCanvas({ seed, className, variant = "thumb" }: FlightPathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0

    function renderThumb() {
      const { ctx, width: w, height: h } = fitCanvas(canvas!)
      ctx.clearRect(0, 0, w, h)

      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, "#141b20")
      grad.addColorStop(1, "#0d1316")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      drawGrid(ctx, w, h, "rgba(143,163,166,0.08)")

      const points = generatePathPoints(w, h, seed, 6)
      ctx.strokeStyle = "rgba(242,134,60,0.85)"
      ctx.lineWidth = 1.75
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.shadowColor = "rgba(242,134,60,0.55)"
      ctx.shadowBlur = 6
      const end = tracePath(ctx, points, 1)
      ctx.shadowBlur = 0

      ctx.fillStyle = "#f2863c"
      ctx.beginPath()
      ctx.arc(end.x, end.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    function setupAnimated() {
      const { ctx, width: w, height: h } = fitCanvas(canvas!)
      const points = generatePathPoints(w, h, seed, 8)

      function paint(fraction: number, driftT?: number) {
        ctx.clearRect(0, 0, w, h)
        drawGrid(ctx, w, h, "rgba(143,163,166,0.05)")

        ctx.strokeStyle = "rgba(242,134,60,0.6)"
        ctx.lineWidth = 2
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.shadowColor = "rgba(242,134,60,0.5)"
        ctx.shadowBlur = 10
        const end = tracePath(ctx, points, fraction)
        ctx.shadowBlur = 0

        const pos = driftT !== undefined ? pointAtFraction(points, driftT) : end
        ctx.fillStyle = "#ffc98c"
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
        ctx.fill()
        if (driftT !== undefined) {
          ctx.strokeStyle = "rgba(255,201,140,0.4)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      if (reduceMotion) {
        paint(1)
        return
      }

      let start = 0
      const drawDuration = 1400
      const driftDuration = 9000

      function driftLoop(ts: number) {
        const t = (ts % driftDuration) / driftDuration
        paint(1, t)
        raf = requestAnimationFrame(driftLoop)
      }

      function drawOn(ts: number) {
        if (!start) start = ts
        const f = Math.min(1, (ts - start) / drawDuration)
        paint(f)
        if (f < 1) raf = requestAnimationFrame(drawOn)
        else raf = requestAnimationFrame(driftLoop)
      }

      raf = requestAnimationFrame(drawOn)
    }

    if (variant === "animated") setupAnimated()
    else renderThumb()

    const onResize = () => {
      cancelAnimationFrame(raf)
      if (variant === "animated") setupAnimated()
      else renderThumb()
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [seed, variant])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
