"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// --- Pure utilities (exported for testing) ---

export interface SparklinePoint {
  x: number
  y: number
  value: number
  index: number
}

export function computeSparklinePoints(
  data: number[],
  width: number,
  height: number,
  padding = 2
): SparklinePoint[] {
  if (data.length < 2) return []
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * innerWidth,
    y: padding + innerHeight - ((value - min) / range) * innerHeight,
    value,
    index,
  }))
}

export function pointsToPolyline(points: SparklinePoint[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
}

export function pointsToGradientPath(
  points: SparklinePoint[],
  width: number,
  height: number
): string {
  if (points.length === 0) return ""
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ")
  return `${line} L${width},${height} L0,${height} Z`
}

// --- Variant system ---

const sparklineVariants = cva("", {
  variants: {
    variant: {
      default: "",
      success: "",
      warning: "",
      danger: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const variantColorMap = {
  default: "var(--chart-1)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const

// --- Components ---

interface SparklineProps extends VariantProps<typeof sparklineVariants> {
  data: number[]
  width?: number
  height?: number
  className?: string
  /** Accessible label for the sparkline */
  label?: string
}

function Sparkline({
  data,
  width = 100,
  height = 32,
  variant = "default",
  className,
  label,
}: SparklineProps) {
  if (data.length < 2) {
    return (
      <div
        data-slot="sparkline"
        data-variant={variant}
        className={cn(
          "inline-flex items-center justify-center text-xs text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        {data.length === 1 && <span>{data[0]}</span>}
      </div>
    )
  }

  const points = computeSparklinePoints(data, width, height)
  const polylineStr = pointsToPolyline(points)
  const gradientPath = pointsToGradientPath(points, width, height)
  const color = variantColorMap[variant ?? "default"]
  const gradientId = React.useId()

  return (
    <div
      data-slot="sparkline"
      data-variant={variant}
      className={cn("inline-block", className)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label ?? `Sparkline: ${data.join(", ")}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path d={gradientPath} fill={`url(#${gradientId})`} />
        <polyline
          points={polylineStr}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

interface SparklineGridItem {
  label: string
  data: number[]
  variant?: "default" | "success" | "warning" | "danger"
}

interface SparklineGridProps {
  items: SparklineGridItem[]
  columns?: number
  className?: string
}

function SparklineGrid({ items, columns = 3, className }: SparklineGridProps) {
  return (
    <div
      data-slot="sparkline-grid"
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          data-slot="sparkline-grid-item"
          className="flex flex-col gap-1"
        >
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <Sparkline
            data={item.data}
            variant={item.variant}
            width={120}
            height={32}
          />
        </div>
      ))}
    </div>
  )
}

export { Sparkline, SparklineGrid, sparklineVariants }
