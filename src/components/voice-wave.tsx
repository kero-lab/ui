'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '../hooks/use-reduced-motion'
import { sampleEnvelope } from './rem-envelope'

// --- Gaussian attenuation (SiriWave-inspired) ---------------------------------
//
// f(x) = (K / (K + |x|^K))^K
// Maps normalized position to an amplitude envelope [0, 1] that peaks at center
// and tapers to near-zero at edges. K=4: smooth bell with well-defined shoulders.
//
// Input: xNorm in [0, 1] representing horizontal position across the canvas.
// Maps to centered range [-2, 2] before applying the formula.
//
function gaussianAttenuation(xNorm: number): number {
  const x = (xNorm - 0.5) * 4 // remap 0..1 → -2..2
  return Math.pow(4 / (4 + Math.pow(Math.abs(x), 4)), 4)
}

// --- Chroma palette ----------------------------------------------------------

const CHROMA_STOPS: Array<{ at: number; l: number; c: number; h: number }> = [
  { at: 0.00, l: 0.55, c: 0.12, h: 162 }, // dim teal (silence)
  { at: 0.25, l: 0.70, c: 0.17, h: 162 }, // emerald
  { at: 0.55, l: 0.65, c: 0.22, h: 270 }, // violet
  { at: 0.80, l: 0.78, c: 0.20, h:  60 }, // warm amber
  { at: 1.00, l: 0.80, c: 0.22, h:  20 }, // hot coral/pink (peak)
]

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function chromaColor(amplitude: number): string {
  const t = Math.max(0, Math.min(1, amplitude))
  for (let i = 0; i < CHROMA_STOPS.length - 1; i++) {
    const a = CHROMA_STOPS[i]
    const b = CHROMA_STOPS[i + 1]
    if (t >= a.at && t <= b.at) {
      const f = (t - a.at) / (b.at - a.at)
      const l = lerpNum(a.l, b.l, f)
      const c = lerpNum(a.c, b.c, f)
      let dh = b.h - a.h
      if (dh > 180) dh -= 360
      if (dh < -180) dh += 360
      const h = a.h + dh * f
      return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
    }
  }
  const last = CHROMA_STOPS[CHROMA_STOPS.length - 1]
  return `oklch(${last.l} ${last.c} ${last.h})`
}

// --- Wave layers -------------------------------------------------------------
//
// Four sinusoid layers with irrational frequency ratios (not integer multiples).
// Avoids harmonic lockup — the beating patterns between layers shift constantly,
// creating organic amplitude variation even at constant drive amplitude.
//
// phaseOffset staggers the layers in time so they don't constructively interfere
// at startup.
//
const WAVE_LAYERS = [
  { freq: 1.00, speed: 0.65, phaseOffset: 0,                 relAmp: 1.00, lineWidth: 2.6 },
  { freq: 2.03, speed: 1.10, phaseOffset: Math.PI * 0.70,    relAmp: 0.60, lineWidth: 1.8 },
  { freq: 3.11, speed: 0.50, phaseOffset: Math.PI * 1.30,    relAmp: 0.40, lineWidth: 1.4 },
  { freq: 5.17, speed: 1.80, phaseOffset: Math.PI * 0.40,    relAmp: 0.22, lineWidth: 1.0 },
] as const

// --- Component ---------------------------------------------------------------

export interface VoiceWaveProps {
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
 * VoiceWave — hybrid Canvas 2D voice visualization.
 *
 * Synthesizes the best of AudioWave and EnvelopeWave:
 * - Smooth composite sinusoids (AudioWave's aesthetics, never jagged)
 * - Gaussian attenuation: waves taper at card edges (SiriWave-style)
 * - Canvas globalCompositeOperation='lighter': additive glow at wave intersections
 * - ctx.shadowBlur proportional to amplitude: breathing glow follows speech rhythm
 * - sampleEnvelope(): Rem's actual speech envelope drives the amplitude breathing
 * - Optional chroma mode: hue shifts through teal→violet→amber→coral with amplitude
 *
 * The wave is always alive (sinusoid layers have irrational frequency ratios,
 * creating constant organic beating). Energy follows Rem's speech rhythm.
 */
export function VoiceWave({
  active = false,
  colorMode = 'static',
  color = 'oklch(0.696 0.17 162.48)',
  className,
}: VoiceWaveProps) {
  const prefersReduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const colorModeRef = useRef(colorMode)
  colorModeRef.current = colorMode
  const colorRef = useRef(color)
  colorRef.current = color
  const smoothAmpRef = useRef(0)
  // Smoothed 0→1 intensity for idle↔active transitions (prevents hard jump)
  const intensityRef = useRef(0)
  // Track canvas pixel size to detect when we need to reset transform
  const canvasSizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function frame(ts: number) {
      if (!canvas || !ctx) return
      if (startRef.current === null) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000
      const isActive = activeRef.current

      // Sync canvas to CSS layout size (+ device pixel ratio for crisp rendering)
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        rafRef.current = requestAnimationFrame(frame)
        return
      }
      const dpr = window.devicePixelRatio || 1
      const newW = Math.round(rect.width * dpr)
      const newH = Math.round(rect.height * dpr)
      if (newW !== canvasSizeRef.current.w || newH !== canvasSizeRef.current.h) {
        canvas.width = newW
        canvas.height = newH
        ctx.scale(dpr, dpr)
        canvasSizeRef.current = { w: newW, h: newH }
      }

      const W = rect.width
      const H = rect.height

      // Clear to transparent each frame
      ctx.clearRect(0, 0, W, H)

      // Smooth intensity 0→1 for idle↔active transition
      // Asymmetric: attack slightly faster than release for responsive feel
      const intensityTarget = isActive ? 1 : 0
      const intensityRate = isActive ? 0.045 : 0.035
      intensityRef.current += (intensityTarget - intensityRef.current) * intensityRate
      const intensity = intensityRef.current

      // Envelope-driven amplitude with smooth lerp (speech rhythm breathing)
      // Playback speed blends with intensity so it ramps rather than snaps
      const playbackSpeed = 0.7 + intensity * 1.3
      const rawAmp = sampleEnvelope(elapsed * playbackSpeed)
      smoothAmpRef.current += (rawAmp - smoothAmpRef.current) * 0.07
      const smoothAmp = smoothAmpRef.current

      // Interpolate scale from idle (0.28×) to active (2.0×) via smoothed intensity
      const scale = 0.28 + intensity * (2.0 - 0.28)
      const effectiveAmp = smoothAmp * scale

      // Resolve stroke and glow colors (clamp to 0-1 for OKLCH interpolation)
      const ampForColor = Math.min(effectiveAmp, 1)
      const strokeColor = colorModeRef.current === 'chroma'
        ? chromaColor(ampForColor)
        : colorRef.current
      const glowColor = colorModeRef.current === 'chroma'
        ? chromaColor(Math.min(ampForColor * 1.4, 1))
        : colorRef.current

      // Layout: bottom-anchored baseline, waves rise upward
      const baseY = H * 0.80
      const maxAmpPx = H * 0.62

      // Additive compositing — glow intensifies where waves overlap
      ctx.globalCompositeOperation = 'lighter'

      WAVE_LAYERS.forEach((layer) => {
        ctx.beginPath()
        ctx.lineWidth = layer.lineWidth

        // Glow radius breathes with amplitude — clamp for visual comfort
        const clampedAmp = Math.min(effectiveAmp, 1)
        ctx.shadowBlur = 3 + clampedAmp * 18
        ctx.shadowColor = glowColor
        ctx.strokeStyle = strokeColor

        // Per-layer opacity: barely visible at idle, bright at peak
        const minOpacity = 0.12
        const maxOpacity = 0.90
        ctx.globalAlpha = Math.min(minOpacity + clampedAmp * (maxOpacity - minOpacity) * layer.relAmp, maxOpacity)

        const N = Math.ceil(W) + 1
        for (let i = 0; i < N; i++) {
          const xNorm = i / (N - 1) // 0..1 across canvas width

          // Gaussian envelope: full amplitude at center, tapers at edges
          const attenuation = gaussianAttenuation(xNorm)

          // Scrolling sine: phase advances over time → wave appears to travel left
          const phase = xNorm * Math.PI * 2 * layer.freq
            + elapsed * layer.speed * Math.PI * 2
            + layer.phaseOffset

          // Amplitude floor so wave is never fully dead.
          // effectiveAmp can exceed 1.0 in active state for dramatic peaks.
          const ampFloor = 0.08
          const ampFactor = ampFloor + effectiveAmp * (1 - ampFloor)

          const y = baseY - Math.sin(phase) * attenuation * maxAmpPx * layer.relAmp * ampFactor

          if (i === 0) ctx.moveTo(i, y)
          else ctx.lineTo(i, y)
        }

        ctx.stroke()
      })

      // Reset to default compositing for next frame's clear
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [prefersReduced])

  if (prefersReduced) {
    return (
      <div
        data-slot="voice-wave"
        data-active={active}
        className={cn('relative h-full w-full', className)}
      />
    )
  }

  return (
    <div
      data-slot="voice-wave"
      data-active={active}
      data-color-mode={colorMode}
      className={cn('relative h-full w-full', className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
