"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useScrollBob } from "../hooks/use-scroll-bob"
import { useTimelineKeyboard } from "../hooks/use-timeline-keyboard"

// --- Pure functions ---

interface TimelineItem {
  timestamp: number
}

type PeriodType = "normal" | "quiet" | "busy"

interface NormalPeriod<T> {
  type: "normal"
  item: T
}

interface QuietPeriod<T> {
  type: "quiet"
  items: T[]
  start: number
  end: number
  /** Number of events below significance threshold hidden in this gap */
  hiddenCount: number
}

interface BusyPeriod<T> {
  type: "busy"
  items: T[]
  start: number
  end: number
  /** Max events in any 5-minute window within this cluster */
  peakDensity: number
}

type Period<T> = NormalPeriod<T> | QuietPeriod<T> | BusyPeriod<T>

/**
 * Compute peak density: max events in any 5-minute window within a set of items.
 */
function computePeakDensity<T extends TimelineItem>(items: T[]): number {
  if (items.length <= 1) return items.length
  const DENSITY_WINDOW = 5 * 60 * 1000 // 5 minutes
  let maxCount = 1
  let start = 0
  for (let end = 0; end < items.length; end++) {
    while (items[end].timestamp - items[start].timestamp > DENSITY_WINDOW) {
      start++
    }
    maxCount = Math.max(maxCount, end - start + 1)
  }
  return maxCount
}

/**
 * Classify a sorted array of timestamped items into normal, quiet, and busy periods.
 *
 * - Quiet: gap > quietThresholdMs with ≤1 event
 * - Busy: busyThreshold+ events within a 30-minute sliding window
 * - Normal: everything else
 */
function classifyPeriods<T extends TimelineItem>(
  items: T[],
  quietThresholdMs = 2 * 60 * 60 * 1000,
  busyThreshold = 5
): Period<T>[] {
  if (items.length === 0) return []
  if (items.length === 1) return [{ type: "normal", item: items[0] }]

  const WINDOW_MS = 30 * 60 * 1000 // 30 minutes
  const result: Period<T>[] = []

  // First pass: identify busy clusters using a sliding window
  const busyRanges: Array<{ start: number; end: number }> = []
  let windowStart = 0

  for (let i = 0; i < items.length; i++) {
    // Move window start forward
    while (windowStart < i && items[i].timestamp - items[windowStart].timestamp > WINDOW_MS) {
      windowStart++
    }
    const windowSize = i - windowStart + 1
    if (windowSize >= busyThreshold) {
      const rangeStart = items[windowStart].timestamp
      const rangeEnd = items[i].timestamp
      // Merge with previous range if overlapping
      if (busyRanges.length > 0) {
        const last = busyRanges[busyRanges.length - 1]
        if (rangeStart <= last.end + WINDOW_MS) {
          last.end = Math.max(last.end, rangeEnd)
          continue
        }
      }
      busyRanges.push({ start: rangeStart, end: rangeEnd })
    }
  }

  // Second pass: classify each item
  let i = 0
  while (i < items.length) {
    // Check if current item is in a busy range
    const busyRange = busyRanges.find(
      (r) => items[i].timestamp >= r.start && items[i].timestamp <= r.end
    )

    if (busyRange) {
      // Collect all items in this busy range
      const busyItems: T[] = []
      while (i < items.length && items[i].timestamp <= busyRange.end) {
        busyItems.push(items[i])
        i++
      }
      result.push({
        type: "busy",
        items: busyItems,
        start: busyRange.start,
        end: busyRange.end,
        peakDensity: computePeakDensity(busyItems),
      })
      continue
    }

    // Check for quiet gap to next item
    if (i < items.length - 1) {
      const gap = items[i + 1].timestamp - items[i].timestamp
      if (gap > quietThresholdMs) {
        // This item is followed by a quiet period
        result.push({ type: "normal", item: items[i] })
        i++
        // The quiet gap is between items[i-1] and items[i]
        // We represent it as a quiet period containing no items
        result.push({
          type: "quiet",
          items: [],
          start: items[i - 1].timestamp,
          end: items[i].timestamp,
          hiddenCount: 0,
        })
        continue
      }
    }

    result.push({ type: "normal", item: items[i] })
    i++
  }

  return result
}

/** Format a duration in milliseconds to a human-readable string. */
function formatTimelineDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

// --- Components ---

interface QuietMarkerProps {
  eventCount: number
  duration: string
  expanded: boolean
  onToggle: () => void
}

interface BusyHeaderProps {
  eventCount: number
  startTime: number
  endTime: number
}

interface ClusterSummaryRenderProps {
  eventCount: number
  startTime: number
  endTime: number
  peakDensity: number
  collapsed: boolean
  onToggle: () => void
}

interface TrendRenderProps<T> {
  before: Period<T>
  after: Period<T>
  gapMs: number
  /** Zero-based index of this gap (0 = first gap between period 0 and 1) */
  index: number
}

interface EventTimelineProps<T extends TimelineItem> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  renderQuietMarker?: (props: QuietMarkerProps) => React.ReactNode
  renderBusyHeader?: (props: BusyHeaderProps) => React.ReactNode
  renderClusterSummary?: (props: ClusterSummaryRenderProps) => React.ReactNode
  renderTrend?: (props: TrendRenderProps<T>) => React.ReactNode | null
  quietThresholdMs?: number
  busyThreshold?: number
  enableScrollBob?: boolean
  enableKeyboardNav?: boolean
  scrollSnapType?: "none" | "proximity" | "mandatory"
  className?: string
}

function EventTimeline<T extends TimelineItem>({
  items,
  renderItem,
  renderQuietMarker,
  renderBusyHeader,
  renderClusterSummary,
  renderTrend,
  quietThresholdMs = 2 * 60 * 60 * 1000,
  busyThreshold = 5,
  enableScrollBob = false,
  enableKeyboardNav = false,
  scrollSnapType = "none",
  className,
}: EventTimelineProps<T>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [expandedQuiet, setExpandedQuiet] = React.useState<Set<number>>(new Set())
  const [collapsedClusters, setCollapsedClusters] = React.useState<Set<number>>(new Set())

  const periods = React.useMemo(
    () => classifyPeriods(items, quietThresholdMs, busyThreshold),
    [items, quietThresholdMs, busyThreshold]
  )

  // Scroll bob
  const { bobClass } = useScrollBob(scrollRef, { maxDisplacement: enableScrollBob ? 6 : 0 })

  // Keyboard navigation
  const { containerProps: keyboardProps } = useTimelineKeyboard(scrollRef, {
    onEscape: () => scrollRef.current?.blur(),
  })

  // Scroll indicators
  const updateScrollIndicators = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollIndicators()
    el.addEventListener("scroll", updateScrollIndicators, { passive: true })
    const ro = new ResizeObserver(updateScrollIndicators)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators)
      ro.disconnect()
    }
  }, [updateScrollIndicators])

  const scrollBy = React.useCallback((direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    })
  }, [])

  const toggleQuiet = React.useCallback((index: number) => {
    setExpandedQuiet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const toggleCluster = React.useCallback((index: number) => {
    setCollapsedClusters((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  if (items.length === 0) {
    return (
      <div
        data-slot="event-timeline"
        className={cn("flex items-center justify-center py-8 text-sm text-white/40", className)}
      >
        No events to display
      </div>
    )
  }

  /** Get the end timestamp of a period (for trend gap calculation). */
  function periodEndTime(p: Period<T>): number {
    if (p.type === "normal") return p.item.timestamp
    return p.end
  }

  /** Get the start timestamp of a period. */
  function periodStartTime(p: Period<T>): number {
    if (p.type === "normal") return p.item.timestamp
    return p.start
  }

  let itemIndex = 0

  const scrollSnapStyles: React.CSSProperties =
    scrollSnapType !== "none"
      ? { scrollSnapType: `x ${scrollSnapType}` }
      : {}

  const itemSnapStyle: React.CSSProperties =
    scrollSnapType !== "none" ? { scrollSnapAlign: "center" } : {}

  return (
    <div data-slot="event-timeline" className={cn("relative", className)}>
      {/* Scroll indicators */}
      {canScrollLeft && (
        <button
          data-slot="event-timeline-scroll-left"
          className="absolute left-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center bg-gradient-to-r from-black/60 to-transparent"
          onClick={() => scrollBy("left")}
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          data-slot="event-timeline-scroll-right"
          className="absolute right-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center bg-gradient-to-l from-black/60 to-transparent"
          onClick={() => scrollBy("right")}
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex items-end gap-3 overflow-x-auto pb-2 pt-7 scrollbar-thin scrollbar-thumb-white/10"
        style={scrollSnapStyles}
        {...(enableKeyboardNav ? keyboardProps : {})}
      >
        {periods.map((period, periodIdx) => {
          // Render trend indicator between periods
          const trendNode =
            renderTrend && periodIdx > 0
              ? renderTrend({
                  before: periods[periodIdx - 1],
                  after: period,
                  gapMs: periodStartTime(period) - periodEndTime(periods[periodIdx - 1]),
                  index: periodIdx - 1,
                })
              : null

          if (period.type === "normal") {
            const idx = itemIndex++
            return (
              <React.Fragment key={`normal-${periodIdx}`}>
                {trendNode && (
                  <div className="flex-shrink-0 relative self-stretch" style={{ width: 1 }}>
                    {/* Hairline connector */}
                    <div className="absolute inset-0 w-px bg-white/10 mx-auto" />
                    {/* Floating badge — above the card row */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap z-20">
                      {trendNode}
                    </div>
                  </div>
                )}
                <div
                  className={cn("flex-shrink-0", enableScrollBob && bobClass)}
                  style={itemSnapStyle}
                >
                  {renderItem(period.item, idx)}
                </div>
              </React.Fragment>
            )
          }

          if (period.type === "quiet") {
            const isExpanded = expandedQuiet.has(periodIdx)
            const duration = formatTimelineDuration(period.end - period.start)

            return (
              <React.Fragment key={`quiet-${periodIdx}`}>
                {trendNode && (
                  <div className="flex-shrink-0 relative self-stretch" style={{ width: 1 }}>
                    {/* Hairline connector */}
                    <div className="absolute inset-0 w-px bg-white/10 mx-auto" />
                    {/* Floating badge — above the card row */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap z-20">
                      {trendNode}
                    </div>
                  </div>
                )}
                <div
                  data-slot="event-timeline-quiet"
                  className="flex-shrink-0 flex items-center"
                >
                  {renderQuietMarker ? (
                    renderQuietMarker({
                      eventCount: period.items.length,
                      duration,
                      expanded: isExpanded,
                      onToggle: () => toggleQuiet(periodIdx),
                    })
                  ) : (
                    <button
                      className="flex items-center gap-2 px-3 py-1 rounded border border-dashed border-white/20 text-xs text-white/40 hover:text-white/60 hover:border-white/30 transition-colors"
                      onClick={() => toggleQuiet(periodIdx)}
                    >
                      <span className="w-8 border-t border-dashed border-white/20" />
                      <span>{duration} quiet</span>
                      <span className="w-8 border-t border-dashed border-white/20" />
                    </button>
                  )}

                  {/* Expanded quiet period items */}
                  {isExpanded && period.items.length > 0 && (
                    <div className="flex items-end gap-3 ml-3">
                      {period.items.map((item) => {
                        const idx = itemIndex++
                        return (
                          <div
                            key={`quiet-item-${idx}`}
                            className={cn("flex-shrink-0", enableScrollBob && bobClass)}
                            style={itemSnapStyle}
                          >
                            {renderItem(item, idx)}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </React.Fragment>
            )
          }

          if (period.type === "busy") {
            const isCollapsed = collapsedClusters.has(periodIdx)

            return (
              <React.Fragment key={`busy-${periodIdx}`}>
                {trendNode && (
                  <div className="flex-shrink-0 relative self-stretch" style={{ width: 1 }}>
                    {/* Hairline connector */}
                    <div className="absolute inset-0 w-px bg-white/10 mx-auto" />
                    {/* Floating badge — above the card row */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap z-20">
                      {trendNode}
                    </div>
                  </div>
                )}
                <div
                  data-slot="event-timeline-busy"
                  className="flex-shrink-0 relative rounded-lg bg-white/[0.03] px-2 py-2"
                >
                  {/* Cluster summary (Phase 4) — sits beside cards horizontally */}
                  {renderClusterSummary ? (
                    <div className="flex items-stretch gap-2">
                      <div className="shrink-0 self-center">
                        {renderClusterSummary({
                          eventCount: period.items.length,
                          startTime: period.start,
                          endTime: period.end,
                          peakDensity: period.peakDensity,
                          collapsed: isCollapsed,
                          onToggle: () => toggleCluster(periodIdx),
                        })}
                      </div>
                      {/* Animated expand/collapse using grid-rows transition */}
                      <div
                        className="grid transition-[grid-template-columns] duration-300 ease-out"
                        style={{
                          gridTemplateColumns: isCollapsed ? "0fr" : "1fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-end gap-2">
                            {period.items.map((item) => {
                              const idx = itemIndex++
                              return (
                                <div
                                  key={`busy-item-${idx}`}
                                  className={cn("flex-shrink-0", enableScrollBob && bobClass)}
                                  style={itemSnapStyle}
                                >
                                  {renderItem(item, idx)}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {renderBusyHeader && (
                        <div className="mb-2">
                          {renderBusyHeader({
                            eventCount: period.items.length,
                            startTime: period.start,
                            endTime: period.end,
                          })}
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        {period.items.map((item) => {
                          const idx = itemIndex++
                          return (
                            <div
                              key={`busy-item-${idx}`}
                              className={cn("flex-shrink-0", enableScrollBob && bobClass)}
                            >
                              {renderItem(item, idx)}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </React.Fragment>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}

export {
  EventTimeline,
  classifyPeriods,
  computePeakDensity,
  formatTimelineDuration,
}

export type {
  TimelineItem,
  Period,
  NormalPeriod,
  QuietPeriod,
  BusyPeriod,
  PeriodType,
  QuietMarkerProps,
  BusyHeaderProps,
  ClusterSummaryRenderProps,
  TrendRenderProps,
  EventTimelineProps,
}
