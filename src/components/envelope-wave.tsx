'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '../hooks/use-reduced-motion'
import { sampleEnvelope } from './rem-envelope'

// --- Noise (same as NoiseWave) ------------------------------------------------

function fract(x: number): number {
  return x - Math.floor(x)
}

function valueNoise(x: number): number {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  const a = fract(Math.sin(i * 127.1 + 311.7) * 43758.5453)
  const b = fract(Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453)
  return a + (b - a) * u
}

function fbm(x: number, t: number, seed: number): number {
  let v = 0, amp = 0.5, freq = 1, total = 0
  for (let o = 0; o < 4; o++) {
    v += amp * valueNoise(x * freq + t * (0.8 + o * 0.55) + seed * 37.31)
    total += amp
    amp *= 0.5
    freq *= 2.13
  }
  return (v / total) * 2 - 1
}

// --- Chroma palette ----------------------------------------------------------

/**
 * Color stops for chroma mode, keyed by envelope amplitude 0–1.
 * Interpolates in oklch space for perceptually uniform transitions.
 */
const CHROMA_STOPS: Array<{ at: number; l: number; c: number; h: number }> = [
  { at: 0.00, l: 0.55, c: 0.12, h: 162 }, // dim teal (silence)
  { at: 0.25, l: 0.70, c: 0.17, h: 162 }, // emerald
  { at: 0.55, l: 0.65, c: 0.22, h: 270 }, // violet
  { at: 0.80, l: 0.78, c: 0.20, h:  60 }, // warm amber
  { at: 1.00, l: 0.80, c: 0.22, h:  20 }, // hot coral/pink (peak)
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Interpolate a color from CHROMA_STOPS at amplitude in [0, 1] */
function chromaColor(amplitude: number): string {
  const t = Math.max(0, Math.min(1, amplitude))
  for (let i = 0; i < CHROMA_STOPS.length - 1; i++) {
    const a = CHROMA_STOPS[i]
    const b = CHROMA_STOPS[i + 1]
    if (t >= a.at && t <= b.at) {
      const f = (t - a.at) / (b.at - a.at)
      const l = lerp(a.l, b.l, f)
      const c = lerp(a.c, b.c, f)
      // Hue: interpolate the short way around
      let dh = b.h - a.h
      if (dh > 180) dh -= 360
      if (dh < -180) dh += 360
      const h = a.h + dh * f
      return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
    }
  }
  return `oklch(${CHROMA_STOPS[CHROMA_STOPS.length - 1].l} ${CHROMA_STOPS[CHROMA_STOPS.length - 1].c} ${CHROMA_STOPS[CHROMA_STOPS.length - 1].h})`
}

// --- Layer configuration -----------------------------------------------------

const LAYERS = [
  { seed: 3,  baseAmp: 22, speed: 0.30, opacity: 0.55, strokeWidth: 2.2 },
  { seed: 17, baseAmp: 12, speed: 0.55, opacity: 0.32, strokeWidth: 1.7 },
  { seed: 31, baseAmp:  6, speed: 0.90, opacity: 0.20, strokeWidth: 1.3 },
  { seed: 53, baseAmp:  3, speed: 1.35, opacity: 0.11, strokeWidth: 1.0 },
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

export interface EnvelopeWaveProps {
  /** Hover/active state — boosts amplitude and playback speed */
  active?: boolean
  /**
   * Color mode:
   * - 'static': single color (uses `color` prop)
   * - 'chroma': hue shifts through palette based on envelope amplitude
   */
  colorMode?: 'static' | 'chroma'
  /** Base stroke color when colorMode='static' */
  color?: string
  className?: string
}

/**
 * EnvelopeWave — noise wave shape with amplitude driven by Rem's voice envelope.
 *
 * The wave is alive (noise-based, never repeats) but its energy follows the
 * speech rhythm of "Good morning everyone, I hope everyone slept well."
 * You can see the word attacks, vowel sustains, and inter-phrase silences.
 *
 * colorMode='chroma': adds hue shifts through a teal→violet→amber→coral palette,
 * making the wave literally change color as the speech amplitude rises and falls.
 */
export function EnvelopeWave({
  active = false,
  colorMode = 'static',
  color = 'oklch(0.696 0.17 162.48)',
  className,
}: EnvelopeWaveProps) {
  const prefersReduced = useReducedMotion()
  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  // Smoothed amplitude for chroma transitions
  const smoothAmpRef = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (prefersReduced) return

    function frame(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000
      const isActive = activeRef.current

      // Playback speed: 1× idle → 1.8× active
      const playbackSpeed = isActive ? 1.8 : 1.0
      const envelopeTime = elapsed * playbackSpeed

      // Raw envelope amplitude at this moment
      const rawAmp = sampleEnvelope(envelopeTime)

      // Smooth the amplitude for visual transitions (slower settle)
      smoothAmpRef.current += (rawAmp - smoothAmpRef.current) * 0.12
      const smoothAmp = smoothAmpRef.current

      // Active boost: scale amplitude up on hover
      const ampBoost = isActive ? 1.6 : 1.0
      const effectiveAmp = smoothAmp * ampBoost

      // Chroma color based on smoothed amplitude
      const currentColor = colorMode === 'chroma' ? chromaColor(smoothAmp) : color

      // Update container filter for glow
      if (containerRef.current) {
        const glowColor = colorMode === 'chroma' ? chromaColor(Math.min(smoothAmp * 1.5, 1)) : color
        const brightness = 1 + effectiveAmp * 0.8
        containerRef.current.style.filter = `brightness(${brightness.toFixed(2)}) drop-shadow(0 0 ${(effectiveAmp * 12).toFixed(1)}px ${glowColor})`
      }

      LAYERS.forEach((layer, i) => {
        const pathEl = pathRefs.current[i]
        const svgEl = svgRefs.current[i]
        if (!pathEl || !svgEl) return

        const t = elapsed * layer.speed
        // Minimum amplitude so the wave is always slightly alive (never fully flat)
        const minAmp = layer.baseAmp * 0.40
        const amp = minAmp + effectiveAmp * layer.baseAmp
        pathEl.setAttribute('d', buildPath(t, layer.seed, amp))

        const baseOpacity = layer.opacity
        const opacityBoost = 0.4 + effectiveAmp * 0.6
        svgEl.style.opacity = String(baseOpacity * opacityBoost)

        if (colorMode === 'chroma') {
          svgEl.style.color = currentColor
        }
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [prefersReduced, colorMode, color])

  return (
    <div
      ref={containerRef}
      data-slot="envelope-wave"
      data-active={active}
      data-color-mode={colorMode}
      className={cn('relative h-full w-full', className)}
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
