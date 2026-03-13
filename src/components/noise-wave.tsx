'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '../hooks/use-reduced-motion'

// --- Noise utilities (pure JS, no library) -----------------------------------

function fract(x: number): number {
  return x - Math.floor(x)
}

/** Smooth value noise: linearly interpolates between hashed integer lattice points */
function valueNoise(x: number): number {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f) // smoothstep
  const a = fract(Math.sin(i * 127.1 + 311.7) * 43758.5453)
  const b = fract(Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453)
  return a + (b - a) * u
}

/**
 * Fractal Brownian Motion: 4 octaves of value noise.
 * Returns a value in [-1, 1].
 * @param x  spatial position
 * @param t  time offset (advances noise field)
 * @param seed  per-layer seed to decorrelate layers
 */
function fbm(x: number, t: number, seed: number): number {
  let v = 0
  let amp = 0.5
  let freq = 1
  let total = 0
  for (let o = 0; o < 4; o++) {
    v += amp * valueNoise(x * freq + t * (0.8 + o * 0.55) + seed * 37.31)
    total += amp
    amp *= 0.5
    freq *= 2.13 // not exact 2x — avoids harmonic repetition
  }
  return (v / total) * 2 - 1
}

// --- Layer configuration -----------------------------------------------------

const LAYERS = [
  { seed: 0,  baseAmp: 22, speed: 0.35, opacity: 0.50, strokeWidth: 2.2 },
  { seed: 13, baseAmp: 12, speed: 0.60, opacity: 0.30, strokeWidth: 1.7 },
  { seed: 29, baseAmp:  6, speed: 0.95, opacity: 0.18, strokeWidth: 1.3 },
  { seed: 47, baseAmp:  3, speed: 1.40, opacity: 0.10, strokeWidth: 1.0 },
] as const

const N_POINTS = 64
const VIEW_W = 400
const VIEW_H = 100
const CENTER_Y = 78 // bottom-anchored — waves rise upward from baseline

function buildPath(t: number, seed: number, amplitude: number): string {
  const parts: string[] = []
  for (let i = 0; i <= N_POINTS; i++) {
    const x = (i / N_POINTS) * VIEW_W
    const n = fbm((i / N_POINTS) * 3.5, t, seed)
    const y = CENTER_Y + n * amplitude
    parts.push(i === 0 ? `M${x.toFixed(1)},${y.toFixed(2)}` : `L${x.toFixed(1)},${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

// --- Component ---------------------------------------------------------------

export interface NoiseWaveProps {
  /** Hover/active state — ramps up speed and amplitude */
  active?: boolean
  /** Stroke color (any CSS color, defaults to emerald) */
  color?: string
  className?: string
}

/**
 * NoiseWave — fractal Brownian motion wave that never repeats.
 *
 * Idle: slow, low amplitude organic motion.
 * Active (hover): smoothly ramps to higher amplitude, faster evolution, glow.
 *
 * Unlike AudioWave (deterministic sine), this is genuinely different every frame.
 */
export function NoiseWave({
  active = false,
  color = 'oklch(0.696 0.17 162.48)',
  className,
}: NoiseWaveProps) {
  const prefersReduced = useReducedMotion()
  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const intensityRef = useRef(0)
  // Keep active in a ref so the RAF closure always sees the current value
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    if (prefersReduced) return

    function frame(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000

      // Smooth intensity: lerp toward target (0 or 1)
      const target = activeRef.current ? 1 : 0
      intensityRef.current += (target - intensityRef.current) * 0.06
      const intensity = intensityRef.current

      // Speed multiplier: 1× idle → 3.5× active
      const speedMul = 1 + intensity * 2.5

      LAYERS.forEach((layer, i) => {
        const pathEl = pathRefs.current[i]
        const svgEl = svgRefs.current[i]
        if (!pathEl || !svgEl) return

        const t = elapsed * layer.speed * speedMul
        const amp = layer.baseAmp * (0.55 + intensity * 0.45)
        pathEl.setAttribute('d', buildPath(t, layer.seed, amp))
        svgEl.style.opacity = String(layer.opacity * (0.5 + intensity * 0.5))
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [prefersReduced])

  return (
    <div
      data-slot="noise-wave"
      data-active={active}
      className={cn('relative h-full w-full', className)}
      style={{
        filter: active
          ? `brightness(1.6) drop-shadow(0 0 10px ${color})`
          : 'brightness(1)',
        transition: 'filter 400ms ease',
      }}
    >
      {LAYERS.map((layer, i) => (
        <svg
          key={i}
          ref={el => { svgRefs.current[i] = el }}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          style={{ opacity: layer.opacity, color }}
        >
          <path
            ref={el => { pathRefs.current[i] = el }}
            fill="none"
            stroke="currentColor"
            strokeWidth={layer.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}
