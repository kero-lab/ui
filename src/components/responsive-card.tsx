"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveCardProps {
  icon: React.ReactNode
  title: string
  value: string | React.ReactNode
  detail?: React.ReactNode
  className?: string
  onClick?: () => void
}

function ResponsiveCard({
  icon,
  title,
  value,
  detail,
  className,
  onClick,
}: ResponsiveCardProps) {
  return (
    <div
      data-slot="responsive-card"
      className={cn(
        "@container",
        "bg-card text-card-foreground rounded-xl border shadow-sm",
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div
        data-slot="responsive-card-layout"
        className={cn(
          "flex items-center justify-center p-3",
          "@sm:justify-start @sm:gap-3 @sm:px-4",
          "@md:flex-col @md:items-start @md:gap-2 @md:p-4"
        )}
      >
        <div
          data-slot="responsive-card-icon"
          className={cn(
            "shrink-0 text-muted-foreground",
            "[&_svg]:size-5",
            "@md:[&_svg]:size-6"
          )}
        >
          {icon}
        </div>

        <div
          data-slot="responsive-card-value"
          className={cn("hidden font-semibold text-lg", "@sm:block")}
        >
          {value}
        </div>

        <div
          data-slot="responsive-card-title"
          className={cn(
            "hidden text-sm text-muted-foreground",
            "@md:block @md:order-first @md:w-full"
          )}
        >
          {title}
        </div>

        {detail && (
          <div
            data-slot="responsive-card-detail"
            className={cn(
              "hidden text-sm text-muted-foreground",
              "@lg:block @lg:w-full @lg:pt-2 @lg:border-t @lg:border-border/50"
            )}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  )
}

export { ResponsiveCard }
