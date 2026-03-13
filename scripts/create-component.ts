#!/usr/bin/env node
/**
 * Component Scaffolder
 *
 * Creates a new component with all required files:
 *   - Component file (.tsx) with data-slot, CVA, cn()
 *   - Unit test file (.test.tsx) with pure function tests
 *   - Story file (.stories.tsx) with lifecycle tags
 *   - Registry entry in component-registry.ts
 *   - Export in index.ts
 *
 * Usage:
 *   bun run --cwd packages/ui scripts/create-component.ts MyComponent
 *   bun run --cwd packages/ui scripts/create-component.ts MyComponent --stage prototype
 *
 * Options:
 *   --stage <stage>   Lifecycle stage (default: prototype)
 *   --compound        Generate compound component pattern (Provider + sub-parts)
 *   --interactive     Include play() test skeleton in story
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const COMPONENTS_DIR = join(import.meta.dirname, '../src/components')
const REGISTRY_PATH = join(import.meta.dirname, '../.storybook/component-registry.ts')
const INDEX_PATH = join(import.meta.dirname, '../src/index.ts')

// --- Parse args ---

const args = process.argv.slice(2)
const name = args.find(a => !a.startsWith('--'))

if (!name) {
  console.error('Usage: create-component.ts <ComponentName> [--stage prototype] [--compound] [--interactive]')
  process.exit(1)
}

const stage = args.includes('--stage')
  ? args[args.indexOf('--stage') + 1] || 'prototype'
  : 'prototype'
const compound = args.includes('--compound')
const interactive = args.includes('--interactive')

// Derive file names
const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
const componentPath = join(COMPONENTS_DIR, `${kebab}.tsx`)
const testPath = join(COMPONENTS_DIR, `${kebab}.test.tsx`)
const storyPath = join(COMPONENTS_DIR, `${kebab}.stories.tsx`)

// Check for conflicts
for (const [label, path] of [['Component', componentPath], ['Test', testPath], ['Story', storyPath]]) {
  if (existsSync(path)) {
    console.error(`${label} already exists: ${path}`)
    process.exit(1)
  }
}

// --- Templates ---

function componentTemplate(): string {
  if (compound) {
    return `'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// --- Context ---

interface ${name}ContextValue {
  // Add shared state here
}

const ${name}Context = React.createContext<${name}ContextValue | null>(null)

export function use${name}() {
  const ctx = React.useContext(${name}Context)
  if (!ctx) throw new Error('use${name} must be used within <${name}>')
  return ctx
}

// --- Root ---

interface ${name}Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ${name}({ children, className, ...props }: ${name}Props) {
  const value: ${name}ContextValue = {
    // Provide shared state
  }

  return (
    <${name}Context value={value}>
      <div
        data-slot="${kebab}"
        className={cn('', className)}
        {...props}
      >
        {children}
      </div>
    </${name}Context>
  )
}

// --- Sub-parts ---

interface ${name}ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ${name}Content({ children, className, ...props }: ${name}ContentProps) {
  return (
    <div
      data-slot="${kebab}-content"
      className={cn('', className)}
      {...props}
    >
      {children}
    </div>
  )
}
`
  }

  return `import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ${name}Props extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary content */
  children?: React.ReactNode
}

export function ${name}({ children, className, ...props }: ${name}Props) {
  return (
    <div
      data-slot="${kebab}"
      className={cn('', className)}
      {...props}
    >
      {children}
    </div>
  )
}
`
}

function testTemplate(): string {
  return `import { describe, it, expect } from 'vitest'

// Pure function tests first — no React needed
describe('${name} helpers', () => {
  it.todo('add pure function tests here')
})

// Component render tests
describe('${name}', () => {
  it.todo('renders with default props')
  it.todo('applies custom className')
  it.todo('forwards data-slot attribute')
})
`
}

function storyTemplate(): string {
  const metaType = compound ? 'Meta' : `Meta<typeof ${name}>`
  const imports = compound
    ? `import { ${name}, ${name}Content } from './${kebab}'`
    : `import { ${name} } from './${kebab}'`

  let playSection = ''
  if (interactive) {
    playSection = `
  play: async ({ canvasElement, step }) => {
    await step('Verify initial render', async () => {
      const root = canvasElement.querySelector('[data-slot="${kebab}"]')!;
      await expect(root).toBeInTheDocument();
    });
  },`
  }

  const interactiveImports = interactive
    ? `import { expect, userEvent, within } from 'storybook/test';\n`
    : ''

  return `import type { Meta, StoryObj } from '@storybook/react-vite';
${interactiveImports}${imports};

const meta = {
  title: 'Components/${name}',
  ${compound ? '' : `component: ${name},\n  `}tags: ['autodocs', 'lifecycle:${stage}'],
} satisfies ${metaType};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default rendering */
export const Default: Story = {${compound ? `
  render: () => (
    <${name}>
      <${name}Content>Content here</${name}Content>
    </${name}>
  ),` : ''}${playSection}
};
`
}

// --- Write files ---

writeFileSync(componentPath, componentTemplate())
console.log(`  Created: src/components/${kebab}.tsx`)

writeFileSync(testPath, testTemplate())
console.log(`  Created: src/components/${kebab}.test.tsx`)

writeFileSync(storyPath, storyTemplate())
console.log(`  Created: src/components/${kebab}.stories.tsx`)

// --- Update registry ---

const registryContent = readFileSync(REGISTRY_PATH, 'utf8')
const today = new Date().toISOString().split('T')[0]

// Insert before the closing comment "// Everything else..."
const insertionPoint = '  // Everything else'
if (registryContent.includes(insertionPoint)) {
  const entry = `  ${name}: {
    stage: '${stage}',
    since: '${today}',
    promotedBy: 'initial',
  },\n\n`
  const updated = registryContent.replace(insertionPoint, entry + insertionPoint)
  writeFileSync(REGISTRY_PATH, updated)
  console.log(`  Registry: added ${name} as '${stage}'`)
} else {
  console.log(`  ⚠ Could not auto-update registry — add manually`)
}

// --- Update index.ts exports ---

const indexContent = readFileSync(INDEX_PATH, 'utf8')
const exportLine = compound
  ? `export { ${name}, ${name}Content, use${name} } from './components/${kebab}'`
  : `export { ${name} } from './components/${kebab}'`

if (!indexContent.includes(kebab)) {
  writeFileSync(INDEX_PATH, indexContent.trimEnd() + '\n' + exportLine + '\n')
  console.log(`  Exports: added to index.ts`)
} else {
  console.log(`  Exports: already in index.ts`)
}

console.log(`\n✓ Created ${name} (${stage})`)
console.log(`  Next steps:`)
console.log(`  1. Implement the component in src/components/${kebab}.tsx`)
console.log(`  2. Add pure function tests in src/components/${kebab}.test.tsx`)
console.log(`  3. Add story variants in src/components/${kebab}.stories.tsx`)
console.log(`  4. Run: bun --bun x vitest --project unit --run`)
console.log(`  5. Run: bun run typecheck`)
