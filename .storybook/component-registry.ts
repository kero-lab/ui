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
 *   - legacy:      Stable but replacement planned — signals "replacement coming" before "stop using this"
 *   - deprecated:  Scheduled for removal, actively migrate away
 *
 * How components move between stages:
 *   1. Manual: Agent updates this file during /handoff when a component is ready
 *   2. Auto-promote: `scripts/check-component-lifecycle.ts` detects 2+ app imports
 *      and prints a warning — agent or human then updates this registry
 *
 * Promotion rules:
 *   - Agents must NEVER self-promote — requires explicit human approval or 2+ app imports
 *   - Promotion checklists (see PROMOTION_CRITERIA) must be satisfied before stage change
 *   - All promotions are recorded via `promotedBy` for audit trail
 *
 * Story titles are matched by extracting the last segment:
 *   'Components/Button' → 'Button'
 *   'Integration/Dashboard' → 'Dashboard'
 *   'Overview/Showcase' → 'Showcase'
 */

export type LifecycleStage = 'stable' | 'prototype' | 'stress-test' | 'legacy' | 'deprecated'

/** Metadata for a component's lifecycle entry */
export interface LifecycleEntry {
  stage: LifecycleStage
  /** ISO date when component entered this stage */
  since: string
  /** Who approved the last stage change (human name, 'auto-promote', or 'initial') */
  promotedBy: string
  /** Optional note about the stage change */
  note?: string
}

/**
 * Criteria that must be met before promoting to each stage.
 * Used by `check-component-lifecycle.ts` to validate promotions.
 */
export const PROMOTION_CRITERIA: Record<LifecycleStage, string[]> = {
  stable: [
    'All unit tests pass',
    'Storybook story with AllVariants showcase',
    'play() tests for interactive behavior',
    'a11y check passes (axe-core)',
    'Works in dark mode',
    'Loading/error/empty states implemented',
    'Exported from index.ts',
    'Added to showcase story',
  ],
  prototype: [
    'Component renders without errors',
    'At least one Storybook story',
    'data-slot attributes on all parts',
    'Basic TypeScript types',
  ],
  'stress-test': [
    'Component renders without errors',
  ],
  legacy: [
    'Replacement component identified',
    'Migration guide documented',
  ],
  deprecated: [
    'Replacement is stable',
    'No app imports remain (or migration timeline set)',
  ],
}

/**
 * Component lifecycle entries with full metadata.
 * If a component isn't listed, it defaults to 'stable' (shipped before registry existed).
 */
export const COMPONENT_LIFECYCLE: Record<string, LifecycleEntry> = {
  // Prototypes — working, may change API
  Sparkline: {
    stage: 'prototype',
    since: '2026-03-10',
    promotedBy: 'initial',
    note: 'Built in #561 phase 3',
  },
  ExpandableRow: {
    stage: 'prototype',
    since: '2026-03-10',
    promotedBy: 'initial',
    note: 'Built in #561 phase 3',
  },
  ResponsiveCard: {
    stage: 'prototype',
    since: '2026-03-10',
    promotedBy: 'initial',
    note: 'Built in #561 phase 3',
  },

  // Stress-tests — DX ecosystem validation, not for production
  StepWizard: {
    stage: 'stress-test',
    since: '2026-03-12',
    promotedBy: 'initial',
    note: 'Built in #561 phase 5, challenge A',
  },
  DataPanel: {
    stage: 'stress-test',
    since: '2026-03-12',
    promotedBy: 'initial',
    note: 'Built in #561 phase 5, challenge B',
  },
  Dashboard: {
    stage: 'stress-test',
    since: '2026-03-12',
    promotedBy: 'initial',
    note: 'Built in #561 phase 5, challenge C (integration story only)',
  },

  // Everything else (Button, Card, Badge, etc.) defaults to 'stable'
}

/** Resolve lifecycle stage for a story title */
export function getLifecycleStage(storyTitle: string): LifecycleStage {
  // Extract last segment: 'Components/Button' → 'Button'
  const name = storyTitle.split('/').pop() ?? storyTitle
  const entry = COMPONENT_LIFECYCLE[name]
  return entry?.stage ?? 'stable'
}

/** Resolve full lifecycle entry for a component name */
export function getLifecycleEntry(name: string): LifecycleEntry | undefined {
  return COMPONENT_LIFECYCLE[name]
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
