import { useRef, useEffect, useId } from "react"
import { useReducedMotion } from "./use-reduced-motion"

interface UseScrollBobOptions {
  maxDisplacement?: number // default 6px
}

/**
 * Adds a subtle vertical bob to items in a horizontal scroll container.
 *
 * Cards near the center of the viewport bob up (negative Y),
 * cards at the edges bob down (positive Y).
 *
 * **Primary**: CSS scroll-driven animations (compositor thread, zero JS cost).
 * Uses `animation-timeline: view(inline)` scoped to each card's visibility.
 *
 * **Fallback**: requestAnimationFrame + transform for browsers without
 * scroll-driven animation support.
 *
 * Returns a class name to apply to each card wrapper and a style tag ID.
 */
export function useScrollBob(
  scrollRef: React.RefObject<HTMLElement | null>,
  options?: UseScrollBobOptions
) {
  const { maxDisplacement = 6 } = options ?? {}
  const reducedMotion = useReducedMotion()
  const styleId = useId()
  const rafRef = useRef<number | null>(null)
  const injectedRef = useRef(false)

  // Generate a stable CSS class name from the id
  const bobClass = `scroll-bob-${styleId.replace(/:/g, "")}`

  useEffect(() => {
    if (reducedMotion) return
    if (injectedRef.current) return

    // Inject CSS for scroll-driven animation
    const style = document.createElement("style")
    style.id = `scroll-bob-style-${styleId.replace(/:/g, "")}`
    style.textContent = `
      @supports (animation-timeline: view()) {
        @keyframes scroll-bob-kf {
          0% { transform: translateY(${maxDisplacement}px); }
          50% { transform: translateY(${-maxDisplacement}px); }
          100% { transform: translateY(${maxDisplacement}px); }
        }
        .${bobClass} {
          animation: scroll-bob-kf linear both;
          animation-timeline: view(inline);
        }
        @media (prefers-reduced-motion: reduce) {
          .${bobClass} {
            animation: none;
            transform: none;
          }
        }
      }
    `
    document.head.appendChild(style)
    injectedRef.current = true

    return () => {
      style.remove()
      injectedRef.current = false
    }
  }, [reducedMotion, bobClass, maxDisplacement, styleId])

  // JS fallback for browsers without animation-timeline: view() support
  useEffect(() => {
    if (reducedMotion) return

    // Check if CSS scroll-driven animations are supported
    const supportsScrollTimeline = CSS.supports("animation-timeline", "view()")
    if (supportsScrollTimeline) return

    const container = scrollRef.current
    if (!container) return

    function update() {
      if (!container) return
      const items = container.querySelectorAll<HTMLElement>(`.${bobClass}`)
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        // Normalized distance from center: -1 (left edge) to 1 (right edge)
        const halfWidth = containerRect.width / 2
        const normalizedDist = Math.max(-1, Math.min(1, (itemCenterX - centerX) / halfWidth))
        // Cosine curve: center = -maxDisplacement (up), edges = +maxDisplacement (down)
        const y = maxDisplacement * (2 * normalizedDist * normalizedDist - 1)
        item.style.transform = `translateY(${-y}px)`
      })

      rafRef.current = requestAnimationFrame(update)
    }

    // Only run during scroll
    let scrolling = false
    function onScroll() {
      if (!scrolling) {
        scrolling = true
        rafRef.current = requestAnimationFrame(() => {
          update()
          scrolling = false
        })
      }
    }

    // Initial position
    update()

    container.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion, scrollRef, bobClass, maxDisplacement])

  return { bobClass: reducedMotion ? "" : bobClass }
}
