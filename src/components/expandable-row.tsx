"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// --- Context ---

interface ExpandableRowContextValue {
  open: boolean
  toggle: () => void
}

const ExpandableRowContext = React.createContext<ExpandableRowContextValue | null>(
  null
)

function useExpandableRow() {
  const ctx = React.useContext(ExpandableRowContext)
  if (!ctx) {
    throw new Error("useExpandableRow must be used within an ExpandableRow")
  }
  return ctx
}

// --- Components ---

interface ExpandableRowProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

/** Context provider that wraps a trigger row + content row. Renders as fragment. */
function ExpandableRow({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: ExpandableRowProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const toggle = React.useCallback(() => {
    const next = !open
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [open, isControlled, onOpenChange])

  return (
    <ExpandableRowContext.Provider value={{ open, toggle }}>
      {children}
    </ExpandableRowContext.Provider>
  )
}

/** Clickable table row that toggles the expandable detail. */
function ExpandableRowTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"tr">) {
  const { open, toggle } = useExpandableRow()

  return (
    <tr
      data-slot="expandable-row"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      tabIndex={0}
      className={cn(
        "hover:bg-muted/50 border-b transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        open && "bg-muted/30",
        className
      )}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      {...props}
    >
      {children}
    </tr>
  )
}

interface ExpandableRowContentProps extends React.ComponentProps<"tr"> {
  colSpan: number
}

/** Animated detail row that expands/collapses based on parent state. */
function ExpandableRowContent({
  className,
  colSpan,
  children,
  ...props
}: ExpandableRowContentProps) {
  const { open } = useExpandableRow()

  return (
    <tr
      data-slot="expandable-row-content"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      className={cn("border-b", className)}
      {...props}
    >
      <td colSpan={colSpan} className="p-0">
        <div
          data-slot="expandable-row-panel"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden min-h-0">
            <div className="p-4">{children}</div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export {
  ExpandableRow,
  ExpandableRowTrigger,
  ExpandableRowContent,
  useExpandableRow,
}
