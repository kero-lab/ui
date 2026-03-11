#!/usr/bin/env node
/**
 * Component Lifecycle Checker
 *
 * Scans the monorepo for @remlab/ui imports and detects components that
 * are used by 2+ apps but still marked as 'prototype' or 'stress-test'.
 *
 * Run: bun run --cwd packages/ui scripts/check-component-lifecycle.ts
 *
 * Also verifies that story file tags match the registry.
 * If tags are out of sync, run: bun run --cwd packages/ui scripts/sync-story-tags.ts
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { COMPONENT_LIFECYCLE, getLifecycleStage, type LifecycleStage } from '../.storybook/component-registry'

const ROOT = join(import.meta.dirname, '../../..')
const UI_SRC = join(ROOT, 'packages/ui/src')

// --- 1. Detect component usage across apps ---

/** Directories that count as separate "apps" */
const APP_DIRS = [
  'deployments/identity/kerohub',
  'deployments/monitoring/remhub',
  'apps/rem-agent-ui',
  'apps/rem-bot',
]

/** Extract imported component names from @remlab/ui imports */
function extractImports(content: string): string[] {
  const names: string[] = []
  // Match: import { Foo, Bar } from '@remlab/ui'
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]@remlab\/ui['"]/g
  let match
  while ((match = re.exec(content))) {
    const imports = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim())
    names.push(...imports.filter(Boolean))
  }
  return names
}

/** Recursively find .ts/.tsx files in a directory */
function findSourceFiles(dir: string): string[] {
  const files: string[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...findSourceFiles(full))
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.stories.')) {
        files.push(full)
      }
    }
  } catch { /* dir doesn't exist */ }
  return files
}

// Scan each app for @remlab/ui imports
const componentUsage: Record<string, Set<string>> = {} // component → set of app dirs

for (const appDir of APP_DIRS) {
  const fullDir = join(ROOT, appDir)
  for (const file of findSourceFiles(fullDir)) {
    const content = readFileSync(file, 'utf8')
    for (const name of extractImports(content)) {
      if (!componentUsage[name]) componentUsage[name] = new Set()
      componentUsage[name].add(appDir)
    }
  }
}

// Check for auto-promote candidates
let hasPromotions = false
for (const [component, apps] of Object.entries(componentUsage)) {
  if (apps.size < 2) continue
  const stage = COMPONENT_LIFECYCLE[component]
  if (stage && stage !== 'stable') {
    console.log(`⚠ AUTO-PROMOTE: "${component}" is '${stage}' but imported by ${apps.size} apps:`)
    for (const app of apps) console.log(`    → ${app}`)
    console.log(`  Update COMPONENT_LIFECYCLE in .storybook/component-registry.ts`)
    hasPromotions = true
  }
}

// --- 2. Verify story file tags match the registry ---

const storyDir = join(UI_SRC, 'components')
const storyFiles = readdirSync(storyDir).filter(f => f.endsWith('.stories.tsx'))
let hasTagMismatches = false

for (const file of storyFiles) {
  const content = readFileSync(join(storyDir, file), 'utf8')

  // Check for storyTags() function calls (should be static arrays)
  if (content.includes('storyTags(')) {
    console.log(`⚠ DYNAMIC TAGS: ${file} — uses storyTags() function call instead of static array`)
    console.log(`  Run: bun run --cwd packages/ui scripts/sync-story-tags.ts`)
    hasTagMismatches = true
    continue
  }

  // Check static tags match registry — find meta title (near 'satisfies Meta' or after 'const meta')
  const metaBlock = content.match(/const\s+meta\s*=\s*\{[\s\S]*?\}\s*satisfies\s+Meta/)
  const titleMatch = metaBlock ? metaBlock[0].match(/title:\s*['"]([^'"]+)['"]/) : null
  const tagsMatch = content.match(/tags:\s*\['autodocs',\s*'lifecycle:([^']+)'\]/)
  if (titleMatch && tagsMatch) {
    const expected = getLifecycleStage(titleMatch[1])
    const actual = tagsMatch[1]
    if (expected !== actual) {
      console.log(`⚠ TAG MISMATCH: ${file} — has lifecycle:${actual}, registry says lifecycle:${expected}`)
      console.log(`  Run: bun run --cwd packages/ui scripts/sync-story-tags.ts`)
      hasTagMismatches = true
    }
  } else if (!tagsMatch) {
    console.log(`⚠ MISSING TAGS: ${file} — no lifecycle tag found`)
    hasTagMismatches = true
  }
}

// --- Summary ---

if (!hasPromotions && !hasTagMismatches) {
  const stableCount = storyFiles.length - Object.keys(COMPONENT_LIFECYCLE).length
  const protoCount = Object.values(COMPONENT_LIFECYCLE).filter(s => s === 'prototype').length
  const stressCount = Object.values(COMPONENT_LIFECYCLE).filter(s => s === 'stress-test').length
  console.log(`✓ Component lifecycle check passed`)
  console.log(`  ${stableCount} stable, ${protoCount} prototype, ${stressCount} stress-test`)
  console.log(`  ${storyFiles.length} story files with correct tags`)
} else {
  process.exit(1)
}
