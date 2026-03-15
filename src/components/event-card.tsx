"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// --- Context ---

interface EventCardContextValue {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
}

const EventCardContext = React.createContext<EventCardContextValue | null>(null)

function useEventCard() {
  const ctx = React.useContext(EventCardContext)
  if (!ctx) {
    throw new Error("useEventCard must be used within an EventCard")
  }
  return ctx
}

// --- Hover delay hook ---

function useHoverExpand(
  onExpandedChange: (expanded: boolean) => void,
  enterDelay = 150,
  leaveDelay = 100
) {
  const enterTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = React.useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    enterTimer.current = setTimeout(() => {
      onExpandedChange(true)
    }, enterDelay)
  }, [onExpandedChange, enterDelay])

  const onMouseLeave = React.useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current)
      enterTimer.current = null
    }
    leaveTimer.current = setTimeout(() => {
      onExpandedChange(false)
    }, leaveDelay)
  }, [onExpandedChange, leaveDelay])

  React.useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [])

  return { onMouseEnter, onMouseLeave }
}

// --- Components ---

type Significance = "high" | "medium" | "low"

interface EventCardProps {
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  accentColor?: string
  significance?: Significance
  className?: string
  children: React.ReactNode
}

/**
 * Hover-to-expand card container for timeline events.
 *
 * The card itself is NOT clickable — it's purely a hover container.
 * Place interactive elements (links, buttons, tooltips) inside
 * EventCardSummary and EventCardDetail as needed.
 */
function EventCard({
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  accentColor,
  significance = "medium",
  className,
  children,
}: EventCardProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(defaultExpanded)
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded
  const reducedMotion = useReducedMotion()

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledExpanded(next)
      onExpandedChange?.(next)
    },
    [isControlled, onExpandedChange]
  )

  const hoverHandlers = useHoverExpand(setExpanded)

  const accentStyle = accentColor
    ? { borderLeftColor: accentColor, borderLeftWidth: "3px", borderLeftStyle: "solid" as const }
    : undefined

  return (
    <EventCardContext.Provider value={{ expanded, setExpanded }}>
      <div
        data-slot="event-card"
        data-state={expanded ? "expanded" : "collapsed"}
        data-significance={significance}
        className={cn(
          "group/card rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm",
          "outline-none transition-shadow",
          "focus-within:ring-2 focus-within:ring-ring/50",
          significance === "high" && "w-56",
          significance === "medium" && "w-44",
          significance === "low" && "w-36",
          className
        )}
        style={accentStyle}
        {...hoverHandlers}
        data-reduced-motion={reducedMotion ? "true" : undefined}
      >
        {children}
      </div>
    </EventCardContext.Provider>
  )
}

/** Always-visible summary content. */
function EventCardSummary({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="event-card-summary"
      className={cn("p-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/** Detail content revealed on hover. Uses CSS grid-rows transition. */
function EventCardDetail({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { expanded } = useEventCard()

  return (
    <div
      data-slot="event-card-detail"
      data-state={expanded ? "expanded" : "collapsed"}
      aria-hidden={!expanded}
      className={cn(
        "grid",
        "transition-[grid-template-rows,opacity] duration-200 ease-out",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
      {...props}
    >
      <div className="overflow-hidden min-h-0">
        <div className={cn("px-3 pb-3 pt-2 border-t border-white/10", className)}>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Clickable action link inside an EventCard.
 * Use this for "View session", "View report", etc.
 * Renders with pointer cursor and underline on hover.
 */
function EventCardAction({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="event-card-action"
      className={cn(
        "group/action inline-flex items-center gap-1 rounded-full",
        "px-2 py-0.5 text-[10px] text-white/50",
        "bg-white/5 hover:bg-white/10 hover:text-white/70",
        "transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-2.5 w-2.5 transition-transform duration-150 group-hover/action:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  )
}

export {
  EventCard,
  EventCardSummary,
  EventCardDetail,
  EventCardAction,
  useEventCard,
}

export type { EventCardProps, Significance }
