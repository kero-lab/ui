"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface FanOutStackProps {
  label?: string
  accentColor?: string
  fanned?: boolean
  defaultFanned?: boolean
  onFanChange?: (fanned: boolean) => void
  maxPreview?: number
  className?: string
  children: React.ReactNode
}

/**
 * Shows children as a stacked deck that fans out on click.
 *
 * Stacked: only the top card is fully visible. Behind cards show as
 * thin colored edge slivers peeking out on the right. Count badge
 * in the top-right corner. Click anywhere to fan out.
 *
 * Fanned: all cards in a row with gap-2, collapse button at end.
 */
function FanOutStack({
  label,
  accentColor,
  fanned: controlledFanned,
  defaultFanned = false,
  onFanChange,
  maxPreview = 3,
  className,
  children,
}: FanOutStackProps) {
  const [uncontrolledFanned, setUncontrolledFanned] = React.useState(defaultFanned)
  const isControlled = controlledFanned !== undefined
  const fanned = isControlled ? controlledFanned : uncontrolledFanned
  const reducedMotion = useReducedMotion()

  const setFanned = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledFanned(next)
      onFanChange?.(next)
    },
    [isControlled, onFanChange]
  )

  const toggle = React.useCallback(() => setFanned(!fanned), [fanned, setFanned])

  const childArray = React.Children.toArray(children)
  const count = childArray.length

  if (count <= 1) {
    return <>{children}</>
  }

  const transitionClass = reducedMotion ? "" : "transition-all duration-200 ease-out"
  // Width of the colored sliver that peeks out behind the top card
  const SLIVER_WIDTH = 6

  return (
    <div
      data-slot="fan-out-stack"
      data-state={fanned ? "fanned" : "stacked"}
      className={cn("relative shrink-0", className)}
    >
      {fanned ? (
        // ── Fanned: full row ──
        <div className="flex items-center gap-2">
          {childArray}
          <button
            onClick={toggle}
            className={cn(
              "shrink-0 flex items-center justify-center",
              "h-6 w-6 rounded-full bg-white/10 text-white/40",
              "hover:bg-white/15 hover:text-white/60",
              "transition-colors duration-150 cursor-pointer"
            )}
            aria-label="Collapse stack"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      ) : (
        // ── Stacked: top card visible, behind cards as colored slivers ──
        <div
          className="group/stack relative cursor-pointer"
          onClick={toggle}
          role="button"
          tabIndex={0}
          aria-label={`${count} items stacked. Click to expand.`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggle()
            }
          }}
        >
          {/* Behind card slivers — thin colored edges peeking right */}
          <div
            className={cn("absolute top-0 bottom-0 right-0 flex", transitionClass)}
            style={{
              // Position slivers to the right of the top card
              transform: `translateX(${Math.min(count - 1, maxPreview - 1) * SLIVER_WIDTH}px)`,
            }}
          >
            {childArray.slice(1, maxPreview).map((_, i) => (
              <div
                key={i}
                className={cn("h-full rounded-r-lg", transitionClass)}
                style={{
                  width: `${SLIVER_WIDTH}px`,
                  backgroundColor: accentColor
                    ? `${accentColor}${Math.round((0.3 - i * 0.1) * 255).toString(16).padStart(2, "0")}`
                    : `rgba(255,255,255,${0.1 - i * 0.03})`,
                  // Offset each sliver
                  marginLeft: i > 0 ? "-1px" : "0",
                }}
              />
            ))}
          </div>

          {/* Top card — fully visible */}
          <div className="relative z-10" style={{ marginRight: `${Math.min(count - 1, maxPreview - 1) * SLIVER_WIDTH}px` }}>
            {childArray[0]}
          </div>

          {/* Count badge */}
          {count > 1 && (
            <span
              className={cn(
                "absolute -top-1.5 z-50",
                "inline-flex items-center justify-center",
                "min-w-[18px] h-[18px] rounded-full px-1",
                "text-[9px] font-medium",
                "bg-white/15 text-white/70 backdrop-blur-sm",
                "ring-1 ring-white/10",
                "transition-colors duration-150",
                "group-hover/stack:bg-white/25 group-hover/stack:text-white/90"
              )}
              style={{
                right: `-${Math.min(count - 1, maxPreview - 1) * SLIVER_WIDTH + 4}px`,
              }}
            >
              {count}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { FanOutStack }
export type { FanOutStackProps }
