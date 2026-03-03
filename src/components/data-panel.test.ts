import { describe, expect, it } from "vitest"
import { filterItems, groupByCategory, sortByValue } from "./data-panel"
import type { DataItem } from "./data-panel"

const ITEMS: DataItem[] = [
  { id: "1", name: "Widget", category: "Tools", value: 10 },
  { id: "2", name: "Gadget", category: "Tools", value: 30 },
  { id: "3", name: "Sprocket", category: "Parts", value: 20 },
  { id: "4", name: "Bolt", category: "Parts", value: 5 },
  { id: "5", name: "Sensor", category: "Electronics", value: 50 },
]

// --- filterItems ---

describe("filterItems", () => {
  it("returns all items for empty query", () => {
    expect(filterItems(ITEMS, "")).toHaveLength(5)
  })

  it("returns all items for whitespace query", () => {
    expect(filterItems(ITEMS, "   ")).toHaveLength(5)
  })

  it("filters by name (case-insensitive)", () => {
    const result = filterItems(ITEMS, "widget")
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("Widget")
  })

  it("filters by category", () => {
    const result = filterItems(ITEMS, "parts")
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.category === "Parts")).toBe(true)
  })

  it("matches partial strings", () => {
    const result = filterItems(ITEMS, "get")
    expect(result).toHaveLength(2) // Widget, Gadget
  })

  it("returns empty for no match", () => {
    expect(filterItems(ITEMS, "zzz")).toHaveLength(0)
  })

  it("handles empty items array", () => {
    expect(filterItems([], "widget")).toHaveLength(0)
  })
})

// --- groupByCategory ---

describe("groupByCategory", () => {
  it("groups items by category", () => {
    const groups = groupByCategory(ITEMS)
    expect(Object.keys(groups)).toHaveLength(3)
    expect(groups["Tools"]).toHaveLength(2)
    expect(groups["Parts"]).toHaveLength(2)
    expect(groups["Electronics"]).toHaveLength(1)
  })

  it("maintains order within groups", () => {
    const groups = groupByCategory(ITEMS)
    expect(groups["Tools"][0].name).toBe("Widget")
    expect(groups["Tools"][1].name).toBe("Gadget")
  })

  it("returns empty object for empty input", () => {
    expect(groupByCategory([])).toEqual({})
  })

  it("handles single-item categories", () => {
    const groups = groupByCategory(ITEMS)
    expect(groups["Electronics"]).toHaveLength(1)
    expect(groups["Electronics"][0].name).toBe("Sensor")
  })
})

// --- sortByValue ---

describe("sortByValue", () => {
  it("sorts ascending", () => {
    const sorted = sortByValue(ITEMS, "asc")
    expect(sorted[0].value).toBe(5)
    expect(sorted[sorted.length - 1].value).toBe(50)
  })

  it("sorts descending", () => {
    const sorted = sortByValue(ITEMS, "desc")
    expect(sorted[0].value).toBe(50)
    expect(sorted[sorted.length - 1].value).toBe(5)
  })

  it("does not mutate the original array", () => {
    const original = [...ITEMS]
    sortByValue(ITEMS, "asc")
    expect(ITEMS).toEqual(original)
  })

  it("handles empty array", () => {
    expect(sortByValue([], "asc")).toEqual([])
  })

  it("handles equal values (stable)", () => {
    const dupes: DataItem[] = [
      { id: "a", name: "A", category: "X", value: 10 },
      { id: "b", name: "B", category: "X", value: 10 },
    ]
    const sorted = sortByValue(dupes, "asc")
    expect(sorted[0].id).toBe("a")
    expect(sorted[1].id).toBe("b")
  })
})
