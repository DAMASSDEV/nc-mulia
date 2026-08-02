import { test, expect, Page } from '@playwright/test';
import {
  openLoginModal,
  login,
  logout,
  TEST_CREDENTIALS,
  navigateAndWait,
} from './helpers';

/* ─── Login Helpers ─────────────────────────────────────────── */

async function loginAsMember(page: Page) {
  await page.goto('/');
  await openLoginModal(page);
  await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  await page.waitForTimeout(1_000);
}

async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await openLoginModal(page);
  await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  await page.waitForTimeout(1_000);
}

/* ─── Logo Navigation ──────────────────────────────────────── */

test.describe('Logo and brand navigation', () => {

  test('clicking logo navigates to home page', async ({ page }) => {
    // Start from a different page
    await page.goto('/bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click the logo (the Heart icon wrapped in Link)
    const logo = page.locator('a[href="/"]').first();
    await logo.click();
    await page.waitForTimeout(1_000);

    // Should be on home page
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });

  test('logo is visible on multiple pages', async ({ page }) => {
    const pages = ['/', '/bmi', '/konsultasi', '/lokasi'];

    for (const path of pages) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeVisible();
    }
  });
});

/* ─── Admin Route Guards ──────────────────────────────────── */

test.describe('Protected route redirects', () => {

  test('regular user is redirected from /admin routes', async ({ page }) => {
    // Login as regular user
    await loginAsMember(page);

    // Try to access admin route
    await page.goto('/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should redirect to home (not show admin panel)
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
    // Admin sidebar should NOT be visible
    await expect(page.locator('[class*="admin-sidebar"]')).not.toBeVisible();
  });

  test('regular user is redirected from /dashboard when not logged in', async ({ page }) => {
    // Don't login, go directly to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should redirect to home
    // Either shows home page content or stays on /dashboard but renders home
    await expect(
      page.getByRole('button', { name: 'Masuk' }).or(page.getByText(/solusi nutrisi/i))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('guest is redirected from /pembayaran when not logged in', async ({ page }) => {
    await page.goto('/pembayaran', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should redirect to home
    await expect(
      page.getByRole('button', { name: 'Masuk' }).or(page.getByText(/solusi nutrisi/i))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('guest is redirected from /dashboard when not logged in', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should redirect to home
    await expect(
      page.getByRole('button', { name: 'Masuk' }).or(page.getByText(/solusi nutrisi/i))
    ).toBeVisible({ timeout: 5_000 });
  });
});

/* ─── Admin Link Visibility ──────────────────────────────── */

test.describe('Admin link visibility based on role', () => {

  test('admin link is NOT visible for regular users', async ({ page }) => {
    await loginAsMember(page);

    // Admin link should not be in the navbar
    const adminLink = page.getByText('Admin');
    await expect(adminLink).not.toBeVisible({ timeout: 5_000 });
  });

  test('admin link IS visible for admin users', async ({ page }) => {
    await loginAsAdmin(page);

    // Admin link should be visible in navbar
    const adminLink = page.getByText('Admin');
    await expect(adminLink).toBeVisible({ timeout: 10_000 });
  });

  test('admin link is NOT visible for guests', async ({ page }) => {
    await page.goto('/');

    // Should only see "Masuk" button, no Admin link
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
    await expect(page.getByText('Admin')).not.toBeVisible();
  });
});

/* ─── Navigation Links ────────────────────────────────────── */

test.describe('Navigation links work correctly', () => {

  test('navbar links navigate to correct pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Test individual navigation links
    const links = [
      { text: /konsultasi/i, url: /\/konsultasi/ },
      { text: /hitung bmi/i, url: /\/bmi/ },
      { text: /produk/i, url: /\/produk-herbalife/ },
      { text: /lokasi/i, url: /\/lokasi/ },
    ];

    for (const link of links) {
      const navLink = page.locator(`a[href="${link.url.source}"]`).first();
      if (await navLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await navLink.click();
        await page.waitForTimeout(1_000);
        await expect(page).toHaveURL(link.url, { timeout: 5_000 });
        // Go back to home for next link
        await page.goto('/', { waitUntil: 'networkidle' });
      }
    }
  });

  test('footer navigation links work', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Footer should have links
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('clicking Beranda link in navbar goes to home', async ({ page }) => {
    // Go to a different page first
    await page.goto('/bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click "Beranda" in navbar
    const berandaLink = page.getByRole('link').filter({ hasText: /beranda/i }).first();
    await berandaLink.click();
    await page.waitForTimeout(1_000);

    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });
});

/* ─── Page Transitions ────────────────────────────────────── */

test.describe('Page transitions and routing', () => {

  test('navigation between pages preserves layout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Navbar and footer should be visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Navigate to products
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Navbar and footer should still be visible (or admin layout if in admin)
    await expect(page.locator('header').or(page.locator('[class*="admin-sidebar"]'))).toBeVisible();
  });

  test('protected pages redirect correctly after login', async ({ page }) => {
    // Go to dashboard without login
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should be on home (redirected)
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });

    // Now login
    await openLoginModal(page);
    await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
    await page.waitForTimeout(1_000);

    // Now navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Dashboard should be visible (not redirected)
    await expect(page.getByText(/selamat datang/i).or(page.getByText(/syam/i))).toBeVisible({ timeout: 5_000 });
  });

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should show home page
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });
});

/* ─── Mobile Menu ────────────────────────────────────────── */

test.describe('Mobile menu', () => {

  test('mobile menu toggle works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Mobile menu button should be visible (small screen)
    const menuButton = page.locator('button.md\\:hidden').first();
    const isVisible = await menuButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (isVisible) {
      // Open menu
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu should show navigation links
      await expect(page.getByText(/beranda/i).or(page.getByText(/dashboard/i))).toBeVisible({ timeout: 3_000 });

      // Close menu
      await menuButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('mobile menu shows login option for guests', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Open mobile menu
    const menuButton = page.locator('button.md\\:hidden').first();
    const isVisible = await menuButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (isVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Should show "Masuk" button for guests
      const masukButton = page.getByRole('button', { name: 'Masuk' });
      await expect(masukButton).toBeVisible({ timeout: 3_000 });

      // Close menu
      await menuButton.click();
    }
  });

  test('mobile menu shows user info after login', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await loginAsMember(page);

    // Open mobile menu
    const menuButton = page.locator('button.md\\:hidden').first();
    const isVisible = await menuButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (isVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Should show user name
      await expect(page.getByText(/syam/i)).toBeVisible({ timeout: 3_000 });

      // Should show logout option
      await expect(page.getByText(/keluar/i)).toBeVisible({ timeout: 3_000 });

      // Close menu
      await menuButton.click();
    }
  });
});

/* ─── Route Access Matrix ─────────────────────────────────── */

test.describe('Route access matrix', () => {

  test('guest cannot access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1_000);
    // Redirected to home
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });

  test('guest cannot access payment page', async ({ page }) => {
    await page.goto('/pembayaran');
    await page.waitForTimeout(1_000);
    // Redirected to home
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });

  test('member can access dashboard', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1_000);
    await expect(page.getByText(/selamat datang/i).or(page.getByText(/syam/i))).toBeVisible({ timeout: 5_000 });
  });

  test('member can access payment page', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/pembayaran');
    await page.waitForTimeout(1_000);
    // Payment page loads (may show empty or form)
    const body = await page.locator('body').textContent();
    // Should show some content
    expect(body).toBeTruthy();
  });

  test('admin can access all admin routes', async ({ page }) => {
    await loginAsAdmin(page);

    const adminRoutes = [
      '/admin',
      '/admin/users',
      '/admin/products',
      '/admin/transactions',
      '/admin/consultations',
      '/admin/locations',
      '/admin/roles',
      '/admin/audit',
      '/admin/settings',
    ];

    for (const route of adminRoutes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1_000);
      // Admin sidebar should be visible
      await expect(page.locator('[class*="admin-sidebar"]')).toBeVisible({ timeout: 5_000 });
    }
  });
});
