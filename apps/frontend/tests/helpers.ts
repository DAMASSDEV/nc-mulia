import { type Page, expect } from '@playwright/test';

/**
 * NC MULIA E2E Test Helpers
 *
 * Shared utilities for interacting with the NC MULIA frontend.
 * These helpers abstract common interactions so test files stay readable.
 */

/** Hardcoded API base for Preview URL (used by helpers that run API calls).
 *  The frontend runs on Vercel with no server-side API proxy for ctx.request,
 *  so we must use the backend Preview URL directly. */
const API_BASE = process.env.PLAYWRIGHT_API_BASE || 'https://nc-mulia-backend-56y17iyg7-dzakysyaams-projects.vercel.app';

/** Module-level real product ID cache. Reset per test via resetProductCache. */
let _realProductIds: string[] = [];

export function _getRealProductIds(): string[] {
  return _realProductIds;
}

export function _setRealProductIds(ids: string[]): void {
  _realProductIds = ids;
}

export function resetProductCache(): void {
  _realProductIds = [];
}

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

  // Wait for error message (indicates failure) OR user email in navbar (indicates success)
  const result = await Promise.race([
    // Failure: error message appears
    page.waitForSelector('[class*="bg-danger-soft"]', { timeout: 5_000 }).then(() => 'error' as const),
    // Success: user email appears in navbar (logged in state)
    page.getByText(email).waitFor({ timeout: 10_000 }).then(() => 'success' as const),
  ]);

  if (result === 'error') {
    throw new Error('Login failed: invalid credentials');
  }

  // Extra wait: ensure auth state is fully propagated before navigation
  await page.waitForTimeout(500);
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

/** Backend URL — Vercel routes /api/* from the frontend domain to the backend. */
const BACKEND_URL = 'https://nc-mulia-frontend-1311mru59-dzakysyaams-projects.vercel.app';

/* ─── Cart Helpers ─────────────────────────────────────────── */

/**
 * Fetches products from the API and caches real DB product IDs (UUID-format).
 * Uses page.evaluate() so cookies from the browser session are included automatically.
 */
export async function waitForProductsToLoad(page: Page): Promise<void> {
  const body = await page.evaluate(async ({ backendUrl }: { backendUrl: string }) => {
    const resp = await fetch(`${backendUrl}/api/products`);
    return resp.json();
  }, { backendUrl: BACKEND_URL });
  _realProductIds = (body.data || [])
    .filter((p: { id: string; isAvailable: boolean; stock: number }) =>
      /^[a-z_]+_[a-z0-9]+$/i.test(p.id) && p.isAvailable && p.stock > 0)
    .map((p: { id: string }) => p.id);
}

/**
 * Clears the user's cart via direct API call and localStorage.
 * Uses page.evaluate() so cookies from the browser session are included.
 */
export async function clearCart(page: Page): Promise<void> {
  await page.evaluate(async ({ backendUrl }: { backendUrl: string }) => {
    await fetch(`${backendUrl}/api/cart`, { method: 'DELETE' });
  }, { backendUrl: BACKEND_URL });
  // Clear localStorage so frontend re-fetches from the clean backend on reload
  await page.evaluate(() => localStorage.removeItem('nc_mulia_cart'));
}

/**
 * Adds a product to the cart via direct API call.
 * Uses page.evaluate() so cookies from the browser session are included.
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  // Ensure product IDs are cached
  if (_realProductIds.length === 0) {
    await waitForProductsToLoad(page);
  }

  if (_realProductIds.length === 0) {
    throw new Error('No available real DB products found. Ensure products exist in DB with stock > 0.');
  }

  const body = await page.evaluate(async ({ backendUrl, productId }: { backendUrl: string; productId: string }) => {
    const resp = await fetch(`${backendUrl}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    return resp.json();
  }, { backendUrl: BACKEND_URL, productId: _realProductIds[0] });

  if (!body.success) {
    throw new Error(`Cart API rejected product ${_realProductIds[0]}: ${body.message}`);
  }
}

/* ─── Admin Helpers ─────────────────────────────────────────── */

/**
 * Navigates to an admin section from the admin overview page.
 */
export async function navigateToAdminSection(page: Page, section: string): Promise<void> {
  await page.goto(`/admin/${section}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}
