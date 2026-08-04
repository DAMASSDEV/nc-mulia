import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for NC MULIA Frontend
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests serially — E2E tests share database state */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry once on failure for Preview */
  retries: process.env.CI ? 2 : 1,

  /* Single worker for Preview (avoids race conditions on shared DB) */
  workers: 1,

  /* Reporter: html output + list + custom progress */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['./tests/reporters/progress-reporter.cjs', {}],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL — set via PLAYWRIGHT_BASE_URL env var */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* Collect trace, screenshot, video on failure only */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Collect console errors */
    actionTimeout: 10_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        headless: true,
      },
    },
  ],

  /* No webServer — use PLAYWRIGHT_BASE_URL for Preview testing */
  webServer: undefined,

  /* Timeout for each test */
  timeout: 30_000,

  /* Expect timeout */
  expect: {
    timeout: 5_000,
  },
});
