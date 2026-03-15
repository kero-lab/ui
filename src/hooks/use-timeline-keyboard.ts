import { useState, useCallback, useMemo } from "react"

interface UseTimelineKeyboardOptions {
  itemSelector?: string
  onSelect?: (index: number) => void
  onEscape?: () => void
}

/**
 * Keyboard navigation for horizontal timelines.
 *
 * - Left/Right arrows move focus between items
 * - Enter activates the focused item (fires onSelect)
 * - Escape clears focus
 * - Focused item gets `data-focused="true"` attribute
 * - Container auto-scrolls to keep focused item centered
 * - Temporarily disables scroll-snap during programmatic scroll
 *   to prevent snap from fighting the keyboard position
 *
 * Apply `containerProps` to the scroll container element.
 */
export function useTimelineKeyboard(
  scrollRef: React.RefObject<HTMLElement | null>,
  options?: UseTimelineKeyboardOptions
) {
  const {
    itemSelector = '[data-slot="event-card"], [data-slot="fan-out-stack"]',
    onSelect,
    onEscape,
  } = options ?? {}

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const getItems = useCallback(() => {
    const container = scrollRef.current
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
  }, [scrollRef, itemSelector])

  const focusItem = useCallback(
    (index: number | null) => {
      const items = getItems()

      // Clear previous focus
      items.forEach((item) => item.removeAttribute("data-focused"))

      if (index === null || index < 0 || index >= items.length) {
        setFocusedIndex(null)
        return
      }

      setFocusedIndex(index)
      const item = items[index]
      item.setAttribute("data-focused", "true")

      // Temporarily disable scroll-snap so it doesn't fight the programmatic scroll
      const container = scrollRef.current
      if (container) {
        const savedSnap = container.style.scrollSnapType
        container.style.scrollSnapType = "none"
        item.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" })
        // Re-enable snap on next frame so the browser doesn't try to snap-correct
        requestAnimationFrame(() => {
          container.style.scrollSnapType = savedSnap
        })
      } else {
        item.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" })
      }
    },
    [getItems, scrollRef]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getItems()
      if (items.length === 0) return

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault()
          const next = focusedIndex === null ? 0 : Math.min(focusedIndex + 1, items.length - 1)
          focusItem(next)
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          const prev = focusedIndex === null ? items.length - 1 : Math.max(focusedIndex - 1, 0)
          focusItem(prev)
          break
        }
        case "Enter":
        case " ": {
          e.preventDefault()
          if (focusedIndex !== null) {
            onSelect?.(focusedIndex)
            // Also simulate a click on the focused item
            items[focusedIndex]?.click()
          }
          break
        }
        case "Escape": {
          e.preventDefault()
          focusItem(null)
          onEscape?.()
          break
        }
      }
    },
    [focusedIndex, focusItem, getItems, onSelect, onEscape]
  )

  const containerProps = useMemo(
    () => ({
      onKeyDown,
      tabIndex: 0,
      role: "listbox" as const,
      "aria-label": "Event timeline",
    }),
    [onKeyDown]
  )

  return {
    focusedIndex,
    setFocusedIndex: focusItem,
    containerProps,
  }
}
