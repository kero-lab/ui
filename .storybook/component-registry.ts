/**
 * Component Lifecycle Registry
 *
 * Single source of truth for component maturity stages.
 * Controls Storybook sidebar tags and filtering.
 *
 * Lifecycle stages:
 *   - stable:      Production-ready, fully tested
 *   - prototype:   Working but may change API, needs more validation
 *   - stress-test: Built to validate the DX ecosystem, not for production use
 *   - deprecated:  Scheduled for removal
 *
 * How components move between stages:
 *   1. Manual: Agent updates this file during /handoff when a component is ready
 *   2. Auto-promote: `scripts/check-component-lifecycle.ts` detects 2+ app imports
 *      and prints a warning — agent or human then updates this registry
 *
 * Story titles are matched by extracting the last segment:
 *   'Components/Button' → 'Button'
 *   'Integration/Dashboard' → 'Dashboard'
 *   'Overview/Showcase' → 'Showcase'
 */

export type LifecycleStage = 'stable' | 'prototype' | 'stress-test' | 'deprecated'

/**
 * Map of story title suffix → lifecycle stage.
 * If a component isn't listed, it defaults to 'stable'.
 */
export const COMPONENT_LIFECYCLE: Record<string, LifecycleStage> = {
  // Prototypes — working, may change API
  Sparkline: 'prototype',
  ExpandableRow: 'prototype',
  ResponsiveCard: 'prototype',

  // Stress-tests — DX ecosystem validation, not for production
  StepWizard: 'stress-test',
  DataPanel: 'stress-test',
  Dashboard: 'stress-test',

  // Everything else (Button, Card, Badge, etc.) defaults to 'stable'
}

/** Resolve lifecycle stage for a story title */
export function getLifecycleStage(storyTitle: string): LifecycleStage {
  // Extract last segment: 'Components/Button' → 'Button'
  const name = storyTitle.split('/').pop() ?? storyTitle
  return COMPONENT_LIFECYCLE[name] ?? 'stable'
}

/** Get the tag name for a lifecycle stage */
export function lifecycleTag(stage: LifecycleStage): string {
  return `lifecycle:${stage}`
}

/**
 * Returns the correct tags array for a story file.
 * Import this in every story meta to get automatic lifecycle tagging.
 *
 * Usage:
 *   import { storyTags } from '../.storybook/component-registry';
 *   // or from stories in src/components/:
 *   import { storyTags } from '../../.storybook/component-registry';
 *
 *   const meta = {
 *     title: 'Components/Button',
 *     tags: storyTags('Components/Button'),
 *   } satisfies Meta<typeof Button>;
 */
export function storyTags(title: string): string[] {
  const stage = getLifecycleStage(title)
  return ['autodocs', `lifecycle:${stage}`]
}
