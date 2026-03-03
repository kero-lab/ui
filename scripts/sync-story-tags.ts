#!/usr/bin/env node
/**
 * Sync Story Tags
 *
 * Reads the component lifecycle registry and updates all story files
 * to use static tag arrays matching the registry. This is needed because
 * Storybook's CSF indexer does static analysis and can't evaluate function calls.
 *
 * Run: bun run --cwd packages/ui scripts/sync-story-tags.ts
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { COMPONENT_LIFECYCLE, getLifecycleStage } from '../.storybook/component-registry'

const STORY_DIR = join(import.meta.dirname, '../src/components')

const files = readdirSync(STORY_DIR).filter(f => f.endsWith('.stories.tsx'))

let fixed = 0
let alreadyCorrect = 0

for (const file of files) {
  const filePath = join(STORY_DIR, file)
  let content = readFileSync(filePath, 'utf8')

  // Check if file uses storyTags() — needs conversion to static array
  const tagCallMatch = content.match(/storyTags\(['"]([^'"]+)['"]\)/)
  if (tagCallMatch) {
    const title = tagCallMatch[1]
    const stage = getLifecycleStage(title)
    const staticTags = `['autodocs', 'lifecycle:${stage}']`

    // Replace storyTags(...) with static array
    content = content.replace(/storyTags\(['"][^'"]+['"]\)/, staticTags)

    // Remove the import line for storyTags
    content = content.replace(/import\s*\{\s*storyTags\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '')

    writeFileSync(filePath, content)
    console.log(`✓ Fixed: ${file} → lifecycle:${stage}`)
    fixed++
    continue
  }

  // Check if file has static tags that match the registry
  const metaBlock = content.match(/const\s+meta\s*=\s*\{[\s\S]*?\}\s*satisfies\s+Meta/)
  const titleMatch = metaBlock ? metaBlock[0].match(/title:\s*['"]([^'"]+)['"]/) : null
  const tagsMatch = content.match(/tags:\s*\['autodocs',\s*'lifecycle:([^']+)'\]/)
  if (titleMatch && tagsMatch) {
    const expectedStage = getLifecycleStage(titleMatch[1])
    const actualStage = tagsMatch[1]
    if (expectedStage !== actualStage) {
      content = content.replace(
        /tags:\s*\['autodocs',\s*'lifecycle:[^']+'\]/,
        `tags: ['autodocs', 'lifecycle:${expectedStage}']`
      )
      writeFileSync(filePath, content)
      console.log(`✓ Updated: ${file} → lifecycle:${expectedStage} (was ${actualStage})`)
      fixed++
    } else {
      alreadyCorrect++
    }
  }
}

console.log(`\n${fixed} files fixed, ${alreadyCorrect} already correct, ${files.length} total story files`)
