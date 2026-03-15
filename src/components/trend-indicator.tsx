"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "flat" | "new"
type TrendSeverity = "positive" | "negative" | "neutral" | "info"

interface TrendIndicatorProps {
  direction: TrendDirection
  label: string
  severity?: TrendSeverity
  sparkData?: number[]
  className?: string
}

const SEVERITY_COLORS: Record<TrendSeverity, string> = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-white/40",
  info: "text-blue-400",
}

const SEVERITY_BG: Record<TrendSeverity, string> = {
  positive: "bg-emerald-500/10",
  negative: "bg-red-500/10",
  neutral: "bg-white/5",
  info: "bg-blue-500/10",
}

function ArrowIcon({ direction, className }: { direction: TrendDirection; className?: string }) {
  if (direction === "new") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    )
  }

  if (direction === "flat") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    )
  }

  // up / down — same arrow, rotated
  return (
    <svg
      className={cn(className, direction === "down" && "rotate-180")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 32
  const h = 10
  const step = w / (data.length - 1)

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ")

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Small inline signal between timeline periods.
 *
 * Shows a directional trend (up/down/flat/new), a label,
 * and an optional mini sparkline. Vertically centered on the river line.
 */
function TrendIndicator({
  direction,
  label,
  severity = "neutral",
  sparkData,
  className,
}: TrendIndicatorProps) {
  return (
    <div
      data-slot="trend-indicator"
      data-direction={direction}
      data-severity={severity}
      className={cn(
        "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full",
        SEVERITY_BG[severity],
        SEVERITY_COLORS[severity],
        "text-[9px]",
        className
      )}
    >
      <ArrowIcon direction={direction} className="h-2.5 w-2.5" />
      <span className="whitespace-nowrap">{label}</span>
      {sparkData && sparkData.length >= 2 && (
        <MiniSparkline data={sparkData} className="opacity-60" />
      )}
    </div>
  )
}

export { TrendIndicator, MiniSparkline }
export type { TrendIndicatorProps, TrendDirection, TrendSeverity }
