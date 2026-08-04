import { test, expect } from '@playwright/test';
import { openLoginModal, login, TEST_CREDENTIALS } from './helpers';

/* ─── Guest (Unauthenticated) Page Tests ─────────────────── */

test.describe('Public pages for guests', () => {

  test.beforeEach(async ({ page }) => {
    // Ensure we start fresh on each page as a guest
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('home page loads without errors', async ({ page }) => {
    // Check hero section is visible
    await expect(page.getByRole('main').getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 10_000 });
    // Check key features are visible
    await expect(page.getByRole('main').getByText(/konsultasi nutrisi/i)).toBeVisible();
    await expect(page.getByRole('main').getByText(/hitung bmi/i)).toBeVisible();
    // No JS errors visible as text, and page renders properly
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('products page shows product catalog', async ({ page }) => {
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });

    // Page title should be visible
    await expect(page.getByRole('main').getByText(/herbalife shop/i)).toBeVisible({ timeout: 10_000 });
    // Search input should be visible
    await expect(page.getByPlaceholder(/cari produk/i)).toBeVisible();
    // At least one product should be displayed (static data always shows products)
    await expect(page.locator('[class*="grid"]').first()).toBeVisible();
    // "Tambah ke Keranjang" button should be visible for products
    await expect(page.locator('button:has-text("Tambah ke Keranjang")').first()).toBeVisible();
  });

  test('location page loads with map section', async ({ page }) => {
    await page.goto('/lokasi', { waitUntil: 'networkidle' });

    // Page heading should be visible
    await expect(page.getByRole('heading').filter({ hasText: /lokasi klinik/i })).toBeVisible({ timeout: 10_000 });
    // Either a map iframe or a "no locations" message should be visible
    const mapOrEmpty = page.locator('iframe[title*="Lokasi"], [class*="bg-surface-secondary"]').first();
    await expect(mapOrEmpty).toBeVisible({ timeout: 10_000 });
  });

  test('bmi page loads and guest can use calculator', async ({ page }) => {
    await page.goto('/bmi', { waitUntil: 'networkidle' });

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /hitung bmi/i })).toBeVisible({ timeout: 10_000 });

    // Input fields should be visible
    await expect(page.getByLabel(/tinggi badan/i)).toBeVisible();
    await expect(page.getByLabel(/berat badan/i)).toBeVisible();

    // Calculate button should be visible
    await expect(page.getByRole('button').filter({ hasText: /hitung sekarang/i })).toBeVisible();

    // Fill in values and calculate
    await page.getByLabel(/tinggi badan/i).fill('170');
    await page.getByLabel(/berat badan/i).fill('65');
    await page.getByRole('button').filter({ hasText: /hitung sekarang/i }).click();

    // Result should appear (BMI value displayed)
    await expect(page.locator('[class*="text-6xl"]')).toBeVisible({ timeout: 5_000 });
  });

  test('consultation page loads - guest sees login prompt', async ({ page }) => {
    await page.goto('/konsultasi', { waitUntil: 'networkidle' });

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /konsultasi nutrisi/i })).toBeVisible({ timeout: 10_000 });
    // Textarea for question should be visible
    await expect(page.locator('textarea')).toBeVisible();
    // Guest should see login prompt
    await expect(page.getByText(/login/i)).toBeVisible();
    // Submit button should exist (but disabled or prompts login)
    await expect(page.getByRole('button').filter({ hasText: /kirim/i })).toBeVisible();
  });

  test('navbar shows Masuk button for guests', async ({ page }) => {
    await page.goto('/');
    // "Masuk" button should be visible in navbar
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
    // Cart icon should be visible
    await expect(page.locator('[title="Keranjang"]')).toBeVisible();
    // No user name or logout button should be visible
    await expect(page.getByRole('button', { name: 'Keluar' })).not.toBeVisible();
  });

  test('cart icon is visible for guests', async ({ page }) => {
    await page.goto('/');
    // Cart icon/link in navbar
    const cartLink = page.locator('a[href="/keranjang"]');
    await expect(cartLink).toBeVisible();
  });

  test('guest can browse home page features section', async ({ page }) => {
    await page.goto('/');
    // Feature cards should be visible
    await expect(page.getByText(/fitur/i).first()).toBeVisible();
    // Stats section should be visible
    await expect(page.getByText(/produk herbalife/i)).toBeVisible();
    // CTA buttons should be visible
    await expect(page.getByText(/siap memulai/i).or(page.getByText(/hitung bmi sekarang/i))).toBeVisible();
  });

  test('guest is redirected to home for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-route-xyz', { waitUntil: 'networkidle' });
    // Should redirect to home
    await expect(page.getByText(/solusi nutrisi/i)).toBeVisible({ timeout: 5_000 });
  });
});
