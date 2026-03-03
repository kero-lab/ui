import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests for @remlab/ui Storybook
 *
 * Navigates Storybook iframe directly and captures screenshot baselines.
 * Platform-specific snapshots via {platform} in playwright.config.ts.
 *
 * Story ID format: title kebab-case--export-kebab-case
 *   e.g., 'Components/Button' + AllVariants = components-button--all-variants
 */

function storyUrl(storyId: string, globals?: string) {
  const base = `/iframe.html?id=${storyId}&viewMode=story`
  return globals ? `${base}&globals=${globals}` : base
}

// ─── Button ──────────────────────────────────────────────────────────────────

test('Button / Default', async ({ page }) => {
  await page.goto(storyUrl('components-button--default'))
  await expect(page.locator('[data-slot="button"]')).toBeVisible()
  await expect(page).toHaveScreenshot('button-default.png')
})

test('Button / AllVariants', async ({ page }) => {
  await page.goto(storyUrl('components-button--all-variants'))
  await expect(page.locator('[data-slot="button"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('button-all-variants.png')
})

// ─── Card ────────────────────────────────────────────────────────────────────

test('Card / Default', async ({ page }) => {
  await page.goto(storyUrl('components-card--default'))
  await expect(page.locator('[data-slot="card"]')).toBeVisible()
  await expect(page).toHaveScreenshot('card-default.png')
})

// ─── Badge ───────────────────────────────────────────────────────────────────

test('Badge / Default', async ({ page }) => {
  await page.goto(storyUrl('components-badge--default'))
  await expect(page.locator('[data-slot="badge"]')).toBeVisible()
  await expect(page).toHaveScreenshot('badge-default.png')
})

// ─── Sparkline ───────────────────────────────────────────────────────────────

test('Sparkline / Variants', async ({ page }) => {
  await page.goto(storyUrl('components-sparkline--variants'))
  await expect(page.locator('[data-slot="sparkline"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('sparkline-variants.png')
})

test('Sparkline / Grid', async ({ page }) => {
  await page.goto(storyUrl('components-sparkline--grid'))
  await expect(page.locator('[data-slot="sparkline-grid"]')).toBeVisible()
  await expect(page).toHaveScreenshot('sparkline-grid.png')
})

// ─── ResponsiveCard ──────────────────────────────────────────────────────────

test('ResponsiveCard / Narrow', async ({ page }) => {
  await page.goto(storyUrl('components-responsivecard--narrow'))
  await expect(page.locator('[data-slot="responsive-card"]')).toBeVisible()
  await expect(page).toHaveScreenshot('responsive-card-narrow.png')
})

test('ResponsiveCard / AllSizes', async ({ page }) => {
  await page.goto(storyUrl('components-responsivecard--all-sizes'))
  await expect(page.locator('[data-slot="responsive-card"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('responsive-card-all-sizes.png')
})

// ─── StepWizard ──────────────────────────────────────────────────────────────

test('StepWizard / AllStepStatuses', async ({ page }) => {
  await page.goto(storyUrl('components-stepwizard--all-step-statuses'))
  await expect(page.locator('[data-slot="step-wizard"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('step-wizard-all-statuses.png')
})

// ─── DataPanel (MSW-driven) ──────────────────────────────────────────────────

test('DataPanel / Loaded', async ({ page }) => {
  await page.goto(storyUrl('components-datapanel--loaded'))
  // Wait for MSW to resolve and items to render
  await expect(page.locator('[data-slot="data-panel-item"]').first()).toBeVisible({ timeout: 10_000 })
  await expect(page).toHaveScreenshot('data-panel-loaded.png')
})

// ─── Theme Toggle ────────────────────────────────────────────────────────────

test('Button / Light Theme', async ({ page }) => {
  await page.goto(storyUrl('components-button--all-variants', 'theme:light'))
  await expect(page.locator('[data-slot="button"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('button-all-variants-light.png')
})

test('Button / Dark Theme', async ({ page }) => {
  await page.goto(storyUrl('components-button--all-variants', 'theme:dark'))
  await expect(page.locator('[data-slot="button"]').first()).toBeVisible()
  await expect(page).toHaveScreenshot('button-all-variants-dark.png')
})
