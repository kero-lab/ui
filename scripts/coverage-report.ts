#!/usr/bin/env node
/**
 * Component Coverage Report
 *
 * Shows coverage status for each component:
 *   - Unit tests (.test.ts/tsx)
 *   - Story (.stories.tsx)
 *   - Story has play() test
 *   - Story has MSW handlers
 *   - Lifecycle stage
 *   - App usage count
 *
 * Run: bun run --cwd packages/ui scripts/coverage-report.ts
 * Flags:
 *   --gaps    Show only components with coverage gaps
 *   --json    Output as JSON for CI consumption
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { COMPONENT_LIFECYCLE, getLifecycleStage } from '../.storybook/component-registry'

const COMPONENTS_DIR = join(import.meta.dirname, '../src/components')
const ROOT = join(import.meta.dirname, '../../..')
const APP_DIRS = [
  'deployments/identity/kerohub',
  'deployments/monitoring/remhub',
  'apps/rem-agent-ui',
  'apps/rem-bot',
]

const showGapsOnly = process.argv.includes('--gaps')
const jsonOutput = process.argv.includes('--json')

// --- Discover components ---

const componentFiles = readdirSync(COMPONENTS_DIR)
  .filter(f => f.endsWith('.tsx') && !f.includes('.stories.') && !f.includes('.test.'))
  .map(f => f.replace('.tsx', ''))
  .sort()

// --- Scan app usage ---

function extractImports(content: string): string[] {
  const names: string[] = []
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]@remlab\/ui['"]/g
  let match
  while ((match = re.exec(content))) {
    const imports = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim())
    names.push(...imports.filter(Boolean))
  }
  return names
}

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

const appUsage: Record<string, number> = {}
for (const appDir of APP_DIRS) {
  for (const file of findSourceFiles(join(ROOT, appDir))) {
    const content = readFileSync(file, 'utf8')
    for (const name of extractImports(content)) {
      appUsage[name] = (appUsage[name] ?? 0) + 1
    }
  }
}

// Convert kebab to PascalCase for matching story exports
function kebabToPascal(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

// --- Build report ---

interface ComponentReport {
  name: string
  kebab: string
  stage: string
  hasUnitTest: boolean
  hasStory: boolean
  storyHasPlay: boolean
  storyHasMsw: boolean
  storyPlayCount: number
  appUsage: number
  gaps: string[]
}

const reports: ComponentReport[] = componentFiles.map(kebab => {
  const pascal = kebabToPascal(kebab)
  const stage = getLifecycleStage(`Components/${pascal}`)

  const testPath1 = join(COMPONENTS_DIR, `${kebab}.test.tsx`)
  const testPath2 = join(COMPONENTS_DIR, `${kebab}.test.ts`)
  const hasUnitTest = existsSync(testPath1) || existsSync(testPath2)

  const storyPath = join(COMPONENTS_DIR, `${kebab}.stories.tsx`)
  const hasStory = existsSync(storyPath)

  let storyHasPlay = false
  let storyHasMsw = false
  let storyPlayCount = 0

  if (hasStory) {
    const storyContent = readFileSync(storyPath, 'utf8')
    storyPlayCount = (storyContent.match(/play:\s*async/g) ?? []).length
    storyHasPlay = storyPlayCount > 0
    storyHasMsw = storyContent.includes('msw:') || storyContent.includes('from \'msw\'')
  }

  const usage = appUsage[pascal] ?? 0

  // Determine gaps (only flag gaps relevant to the lifecycle stage)
  const gaps: string[] = []
  if (!hasStory) gaps.push('no story')
  if (stage !== 'stress-test' && stage !== 'deprecated') {
    if (hasStory && !storyHasPlay) gaps.push('no play() test')
    // Only flag missing unit tests for complex components (non-primitive)
    const isPrimitive = ['button', 'badge', 'card', 'input', 'label', 'separator',
      'skeleton', 'scroll-area', 'slider', 'checkbox', 'select', 'tabs',
      'tooltip', 'dialog', 'dropdown-menu', 'collapsible', 'sheet', 'table'].includes(kebab)
    if (!isPrimitive && !hasUnitTest) gaps.push('no unit test')
  }

  return { name: pascal, kebab, stage, hasUnitTest, hasStory, storyHasPlay, storyHasMsw, storyPlayCount, appUsage: usage, gaps }
})

// --- Output ---

if (jsonOutput) {
  console.log(JSON.stringify(reports, null, 2))
  process.exit(0)
}

// Group by stage
const stageOrder = ['stable', 'prototype', 'legacy', 'stress-test', 'deprecated']
const byStage = stageOrder.map(stage => ({
  stage,
  items: reports.filter(r => r.stage === stage),
})).filter(g => g.items.length > 0)

const filtered = showGapsOnly
  ? byStage.map(g => ({ ...g, items: g.items.filter(r => r.gaps.length > 0) })).filter(g => g.items.length > 0)
  : byStage

if (filtered.length === 0) {
  console.log('✓ No coverage gaps found')
  process.exit(0)
}

const col = (s: string, w: number) => s.padEnd(w).slice(0, w)
const check = (v: boolean) => v ? '✓' : '✗'

console.log(`\nComponent Coverage Report${showGapsOnly ? ' (gaps only)' : ''}`)
console.log('─'.repeat(80))
console.log(`${col('Component', 26)} ${col('Stage', 12)} Unit  Story Play  MSW  Apps  Gaps`)
console.log('─'.repeat(80))

for (const { stage, items } of filtered) {
  for (const r of items) {
    const gapStr = r.gaps.length > 0 ? r.gaps.join(', ') : ''
    const playStr = r.storyHasPlay ? `✓(${r.storyPlayCount})` : '✗   '
    console.log(
      `${col(r.name, 26)} ${col(stage, 12)} ${check(r.hasUnitTest)}     ${check(r.hasStory)}     ${playStr.padEnd(5)} ${check(r.storyHasMsw)}    ${String(r.appUsage).padEnd(5)} ${gapStr}`
    )
  }
  console.log()
}

// Summary
const totalGaps = reports.filter(r => r.gaps.length > 0).length
const totalPlay = reports.filter(r => r.storyHasPlay).length
const totalUnit = reports.filter(r => r.hasUnitTest).length
console.log(`Summary: ${reports.length} components | ${totalUnit} unit tests | ${totalPlay} play() tests | ${totalGaps} with gaps`)
