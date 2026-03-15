"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ClusterSummaryProps {
  eventCount: number
  startTime: number
  endTime: number
  collapsed?: boolean
  defaultCollapsed?: boolean
  onToggle?: () => void
  renderStats?: () => React.ReactNode
  className?: string
}

function formatClusterDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

/**
 * Aggregate summary card for a busy period in a timeline.
 *
 * Visually distinct from event cards — wider, horizontal layout,
 * gradient background, no left accent border. Sits before individual
 * cards in a busy cluster.
 *
 * When collapsed (default), individual cards behind it are hidden.
 * Click "show N events" to expand.
 */
function ClusterSummary({
  eventCount,
  startTime,
  endTime,
  collapsed: controlledCollapsed,
  defaultCollapsed = true,
  onToggle,
  renderStats,
  className,
}: ClusterSummaryProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed)
  const isControlled = controlledCollapsed !== undefined
  const collapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed

  const toggle = React.useCallback(() => {
    if (!isControlled) setUncontrolledCollapsed((c) => !c)
    onToggle?.()
  }, [isControlled, onToggle])

  const duration = formatClusterDuration(endTime - startTime)

  return (
    <div
      data-slot="cluster-summary"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "shrink-0 rounded-lg",
        "bg-gradient-to-r from-white/[0.06] to-white/[0.02]",
        "border border-white/10 border-dashed",
        "backdrop-blur-sm",
        "w-32",
        className
      )}
    >
      <div className="p-2 space-y-1.5">
        {/* Header: count + duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Burst icon */}
            <svg
              className="h-3.5 w-3.5 text-white/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v18" />
              <path d="m18 9-6 6-6-6" />
              <path d="M5 3h14" />
            </svg>
            <span className="text-[11px] font-medium text-white/70">
              {eventCount} events
            </span>
          </div>
          <span className="text-[9px] text-white/40">{duration}</span>
        </div>

        {/* Stats slot */}
        {renderStats && (
          <div className="text-[10px] text-white/50">
            {renderStats()}
          </div>
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            "w-full flex items-center justify-center gap-1",
            "rounded-md py-1 text-[9px]",
            "bg-white/5 text-white/40",
            "hover:bg-white/10 hover:text-white/60",
            "transition-colors duration-150 cursor-pointer"
          )}
        >
          {collapsed ? (
            <>
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
              show {eventCount} events
            </>
          ) : (
            <>
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6" />
              </svg>
              collapse
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export { ClusterSummary, formatClusterDuration }
export type { ClusterSummaryProps }
