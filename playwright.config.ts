import { defineConfig, devices } from '@playwright/test'

/**
 * Visual Regression Tests — Playwright
 *
 * BASELINES: Captured per-platform. Snapshots stored in __snapshots__/
 * with {platform} suffix (e.g., "Button-Default-darwin.png").
 *
 * Cross-platform: macOS and Linux produce different font rendering.
 * Each platform has its own baseline set. On first run on a new platform:
 *   bun run test:visual -- --update-snapshots
 *
 * Run locally: bun run test:visual
 * Update baselines: bun run test:visual -- --update-snapshots
 */
export default defineConfig({
  testDir: './src/components/__tests__',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: 'http://localhost:6006',
    actionTimeout: 5000,
  },
  snapshotPathTemplate:
    '{testDir}/__snapshots__/{testFileName}/{arg}-{platform}{ext}',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node node_modules/.bin/storybook dev -p 6006 --no-open',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
})
