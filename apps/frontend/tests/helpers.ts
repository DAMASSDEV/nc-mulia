import { type Page, type Locator, expect } from '@playwright/test';

/**
 * NC MULIA E2E Test Helpers
 *
 * Shared utilities for interacting with the NC MULIA frontend.
 * These helpers abstract common interactions so test files stay readable.
 */

/* ─── Credentials ─────────────────────────────────────────── */

/** Default test user credentials (seeded in the database) */
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@nc-mulia.com',
    password: 'password',
  },
  user: {
    email: 'syam@nc-mulia.com',
    password: 'password',
  },
} as const;

/* ─── Auth Helpers ─────────────────────────────────────────── */

/**
 * Opens the login modal by clicking the "Masuk" button in the navbar.
 * Works for both desktop (button) and mobile (menu) layouts.
 */
export async function openLoginModal(page: Page): Promise<void> {
  // Try desktop button first
  const desktopButton = page.getByRole('button', { name: 'Masuk' });
  if (await desktopButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await desktopButton.click();
    return;
  }

  // Fall back to mobile menu
  const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu, [class*="lucide"]') }).first();
  await mobileMenuButton.click();
  await page.getByRole('button', { name: 'Masuk' }).click();
}

/**
 * Fills and submits the login form.
 * Assumes the login modal is already open.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).last().click();

  // Wait for modal to close (indicates success) or error to appear
  await Promise.race([
    // Success: modal closes and user name appears in navbar
    page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 10_000 }),
    // Failure: error message appears
    page.waitForSelector('[class*="bg-danger-soft"]', { timeout: 5_000 }),
  ]);
}

/**
 * Logs out the current user by clicking the logout button in the navbar.
 */
export async function logout(page: Page): Promise<void> {
  // Desktop logout button
  const desktopLogout = page.locator('button[title="Keluar"]');
  if (await desktopLogout.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await desktopLogout.click();
    await page.waitForSelector('button:has-text("Masuk")', { timeout: 5_000 });
    return;
  }

  // Mobile logout (in mobile menu)
  await page.locator('button').filter({ hasText: '' }).first().click().catch(() => {});
  // Open mobile menu
  const mobileToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
  await mobileToggle.click().catch(() => {});
  await page.getByRole('button').filter({ hasText: /keluar/i }).click();
  await page.waitForSelector('button:has-text("Masuk")', { timeout: 5_000 });
}

/* ─── Page Navigation Helpers ─────────────────────────────── */

/**
 * Navigates to a URL and waits for the main content to be visible.
 * Uses page-specific selectors to ensure the page has loaded.
 */
export async function navigateAndWait(
  page: Page,
  path: string,
  options?: { waitForSelector?: string }
): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' });

  if (options?.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, { timeout: 10_000 });
  } else {
    // Default: wait for the main content area to appear
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // Allow React to render
  }
}

/**
 * Waits for the page to stabilize after navigation or interaction.
 * Useful after clicking buttons that trigger async operations.
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
}

/* ─── Mobile Helpers ───────────────────────────────────────── */

/**
 * Opens the mobile menu if visible, or does nothing if already on desktop.
 */
export async function openMobileMenu(page: Page): Promise<void> {
  const menuButton = page.locator('button.md\\:hidden').first();
  if (await menuButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await menuButton.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Closes the mobile menu if open.
 */
export async function closeMobileMenu(page: Page): Promise<void> {
  const closeButton = page.locator('button.md\\:hidden').first();
  if (await closeButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const isMenuOpen = await page.locator('text=Dashboard').first().isVisible({ timeout: 1_000 }).catch(() => false);
    if (isMenuOpen) {
      await closeButton.click();
      await page.waitForTimeout(300);
    }
  }
}

/* ─── UI Helpers ───────────────────────────────────────────── */

/**
 * Waits for a loading spinner to disappear from the page.
 */
export async function waitForLoadingToFinish(page: Page): Promise<void> {
  // Wait for any loading spinner to vanish
  const spinner = page.locator('[class*="animate-spin"]');
  await page.waitForFunction(
    () => !document.querySelector('[class*="animate-spin"]'),
    { timeout: 15_000 }
  ).catch(() => {/* ignore if already gone */});
}

/**
 * Generates a unique email address using a timestamp.
 * Useful for registration tests that need unique emails each run.
 */
export function uniqueEmail(): string {
  return `e2e_${Date.now()}_${Math.random().toString(36).slice(2)}@nc-mulia.com`;
}

/**
 * Dismisses any visible error or success toast messages.
 */
export async function dismissToasts(page: Page): Promise<void> {
  const closeButtons = page.locator('[class*="toast"] button, [class*="notice"] button, button:has-text("Tutup"), button:has-text("✕")');
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    const btn = closeButtons.nth(0);
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }
}

/* ─── Cart Helpers ─────────────────────────────────────────── */

/**
 * Adds a product to the cart from the products page.
 * Assumes the products page is already loaded.
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  // Find the first "Tambah ke Keranjang" button
  const addButton = page.locator('button:has-text("Tambah ke Keranjang")').first();
  await addButton.click();
  // Wait for the "Ditambahkan!" or "Sudah di Keranjang" state
  await page.waitForSelector(
    page.locator('button:has-text("Ditambahkan"), button:has-text("Sudah di Keranjang")'),
    { timeout: 5_000 }
  );
}

/* ─── Admin Helpers ─────────────────────────────────────────── */

/**
 * Navigates to an admin section from the admin overview page.
 */
export async function navigateToAdminSection(page: Page, section: string): Promise<void> {
  await page.goto(`/admin/${section}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}
