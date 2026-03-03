"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

// --- Domain types ---

interface DataItem {
  id: string
  name: string
  category: string
  value: number
}

// --- Pure helpers (exported for testing) ---

function filterItems(items: DataItem[], query: string): DataItem[] {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  )
}

function groupByCategory(items: DataItem[]): Record<string, DataItem[]> {
  const groups: Record<string, DataItem[]> = {}
  for (const item of items) {
    ;(groups[item.category] ??= []).push(item)
  }
  return groups
}

function sortByValue(items: DataItem[], dir: "asc" | "desc"): DataItem[] {
  return [...items].sort((a, b) =>
    dir === "asc" ? a.value - b.value : b.value - a.value
  )
}

// --- Component ---

interface DataPanelProps {
  className?: string
  /** API base path (default: /api/data-panel) */
  apiBase?: string
  /** Debounce delay in ms — override to 0 for non-debounce test stories (default: 300) */
  searchDebounceMs?: number
}

function DataPanel({
  className,
  apiBase = "/api/data-panel",
  searchDebounceMs = 300,
}: DataPanelProps) {
  const [items, setItems] = React.useState<DataItem[]>([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [createStatus, setCreateStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle")
  const [createName, setCreateName] = React.useState("")
  const [createCategory, setCreateCategory] = React.useState("")

  const debouncedSearch = useDebounce(search, searchDebounceMs)

  // Fetch items on mount + when debounced search changes
  React.useEffect(() => {
    setLoading(true)
    setError(null)
    const url = debouncedSearch
      ? `${apiBase}/items?q=${encodeURIComponent(debouncedSearch)}`
      : `${apiBase}/items`

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: DataItem[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [apiBase, debouncedSearch])

  // Optimistic create
  function handleCreate() {
    if (!createName.trim()) return
    const optimisticId = `opt-${Date.now()}`
    const optimisticItem: DataItem = {
      id: optimisticId,
      name: createName,
      category: createCategory || "Uncategorized",
      value: 0,
    }

    setItems((prev) => [optimisticItem, ...prev])
    setCreateStatus("pending")

    fetch(`${apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName, category: createCategory }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((created: DataItem) => {
        setItems((prev) =>
          prev.map((i) => (i.id === optimisticId ? created : i))
        )
        setCreateStatus("success")
        setCreateName("")
        setCreateCategory("")
      })
      .catch(() => {
        setItems((prev) => prev.filter((i) => i.id !== optimisticId))
        setCreateStatus("error")
      })
  }

  // Refresh
  function handleRefresh() {
    setLoading(true)
    setError(null)
    fetch(`${apiBase}/items`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: DataItem[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div data-slot="data-panel" className={cn("flex flex-col gap-4", className)}>
      {/* Search */}
      <div data-slot="data-panel-search" className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
            "text-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          )}
        />
        <button
          type="button"
          data-slot="data-panel-refresh"
          onClick={handleRefresh}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            "border border-input bg-background hover:bg-accent"
          )}
        >
          Refresh
        </button>
      </div>

      {/* Status */}
      <div data-slot="data-panel-status" className="text-sm text-muted-foreground">
        {loading
          ? "Loading…"
          : error
            ? `Error: ${error}`
            : `${items.length} items`}
      </div>

      {/* Item list */}
      <ul data-slot="data-panel-list" className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            data-slot="data-panel-item"
            data-id={item.id}
            data-category={item.category}
            data-optimistic={item.id.startsWith("opt-") ? "true" : undefined}
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
              item.id.startsWith("opt-") && "opacity-60 border-dashed"
            )}
          >
            <span>{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {item.category} · {item.value}
            </span>
          </li>
        ))}
      </ul>

      {/* Create form */}
      <div data-slot="data-panel-create" className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Name</label>
          <input
            type="text"
            data-slot="data-panel-create-name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className={cn(
              "flex h-9 rounded-md border border-input bg-transparent px-3 py-1",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <input
            type="text"
            data-slot="data-panel-create-category"
            value={createCategory}
            onChange={(e) => setCreateCategory(e.target.value)}
            className={cn(
              "flex h-9 rounded-md border border-input bg-transparent px-3 py-1",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            )}
          />
        </div>
        <button
          type="button"
          data-slot="data-panel-submit"
          data-status={createStatus}
          disabled={createStatus === "pending" || !createName.trim()}
          onClick={handleCreate}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {createStatus === "pending" ? "Creating…" : "Create"}
        </button>
      </div>

      {/* Create status feedback */}
      {createStatus === "error" && (
        <p data-slot="data-panel-error" className="text-sm text-destructive">
          Failed to create item
        </p>
      )}
      {createStatus === "success" && (
        <p data-slot="data-panel-success" className="text-sm text-primary">
          Item created
        </p>
      )}
    </div>
  )
}

export { DataPanel, filterItems, groupByCategory, sortByValue }
export type { DataItem, DataPanelProps }
