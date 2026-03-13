'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export interface AudioWaveProps {
  /**
   * When true, waves animate to a higher-energy state — increased amplitude,
   * brightness, and a glow. Wire to hover/focus on the parent container.
   */
  active?: boolean
  /**
   * CSS color for all wave strokes. Defaults to emerald (voice/synthesis palette).
   * Accepts any CSS color: hex, oklch, hsl, var(--...).
   */
  color?: string
  className?: string
}

// ── Wave math ────────────────────────────────────────────────────────────────
//
// For seamless looping (translateX 0 → -50% animation on a w-[200%] SVG):
// The visible window slides from SVG x=0..200 to x=200..400, then jumps back.
// Seamless = path(x+200) must equal path(x) for all x.
// For a sinusoid A*sin(2π*n*t + φ) where t = x/400:
//   path(x+200) = A*sin(2π*n*(x+200)/400 + φ) = A*sin(2π*n*x/400 + π*n + φ)
//   This equals path(x) iff cos(π*n) = 1, i.e. n is an even integer.
//
// Layers: cycles=2,6,10,16 (all even) — harmonic but non-repeating-looking
// when combined, with different phases and speeds per layer.

const LAYERS = [
  // [cycles/400units, phase, amplitude, scroll-duration-sec, opacity-idle]
  { cycles: 2,  phase: 0,            amp: 18,  dur: 9,   opacity: 0.50 },
  { cycles: 6,  phase: Math.PI / 3,  amp: 9,   dur: 6.5, opacity: 0.30 },
  { cycles: 10, phase: Math.PI / 1.7, amp: 4.5, dur: 4.5, opacity: 0.18 },
  { cycles: 16, phase: 2.1,          amp: 2,   dur: 3,   opacity: 0.10 },
] as const

function buildPath(cycles: number, phase: number, amplitude: number): string {
  // 300 sampled L-commands over a 400-unit SVG → visually smooth lines
  const N = 300
  const parts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = (t * 400).toFixed(1)
    const y = (50 + amplitude * Math.sin(2 * Math.PI * cycles * t + phase)).toFixed(2)
    parts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
  }
  return parts.join(' ')
}

// Pre-computed at module load — never re-generated per render
const WAVE_PATHS = LAYERS.map((l, i) => ({
  ...l,
  d: buildPath(l.cycles, l.phase, l.amp),
  // Stroke thicknesses: thicker for slow/low-freq layers, finer for texture
  strokeWidth: 2.2 - i * 0.35,
}))

// ── Component ────────────────────────────────────────────────────────────────

export function AudioWave({
  active = false,
  color = 'oklch(0.696 0.17 162.48)',
  className,
}: AudioWaveProps) {
  const prefersReduced = useReducedMotion()

  return (
    <div
      data-slot="audio-wave"
      data-active={active}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{
        transformOrigin: 'bottom',
        transform: active ? 'scaleY(1.55)' : 'scaleY(1)',
        filter: active
          ? `brightness(1.7) drop-shadow(0 0 8px ${color})`
          : 'brightness(1)',
        // CSS spring-ish: cubic-bezier overshoot approximates spring stiffness=280 damping=22
        transition: 'transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1), filter 350ms ease',
      }}
    >
      {WAVE_PATHS.map((layer, i) => (
        <svg
          key={i}
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[200%]"
          style={{
            opacity: active ? Math.min(layer.opacity * 2.1, 0.88) : layer.opacity,
            transition: 'opacity 350ms ease',
            animation: prefersReduced
              ? 'none'
              : `wave ${layer.dur}s linear infinite`,
            color,
          }}
        >
          <path
            d={layer.d}
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
