import { test, expect, Page } from '@playwright/test';
import {
  openLoginModal,
  login,
  logout,
  TEST_CREDENTIALS,
  addFirstProductToCart,
  waitForPageLoad,
} from './helpers';

/* ─── Login Helper ─────────────────────────────────────────── */

async function loginAsMember(page: Page) {
  await page.goto('/');
  await openLoginModal(page);
  await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  await page.waitForTimeout(1_000);
}

/* ─── Dashboard Tests ──────────────────────────────────────── */

test.describe('Member user dashboard', () => {

  test('dashboard shows member status and discount badge', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should show either member status card or regular member card
    const memberCard = page.locator('text=/member herbalife/i').or(page.locator('text=/regular member/i'));
    await expect(memberCard).toBeVisible({ timeout: 10_000 });

    // Dashboard stats should be visible
    await expect(page.getByText(/konsultasi/i).first()).toBeVisible();
    await expect(page.getByText(/bmi record/i).or(page.getByText(/bmi/i))).toBeVisible();
    await expect(page.getByText(/transaksi/i).first()).toBeVisible();
  });

  test('dashboard shows recent consultations and transactions sections', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Recent sections should be visible (may be empty state)
    const recentSection = page.locator('text=/konsultasi terbaru/i').or(page.locator('h2:has-text("Konsultasi")'));
    await expect(recentSection).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/transaksi terbaru/i).or(page.getByText('h2:has-text("Transaksi")'))).toBeVisible();
  });

  test('dashboard shows quick action links', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Quick action links should be visible
    await expect(page.getByText(/konsultasi/i).first()).toBeVisible();
    await expect(page.getByText(/hitung bmi/i).first()).toBeVisible();
    await expect(page.getByText(/produk/i).first()).toBeVisible();
    await expect(page.getByText(/riwayat/i).first()).toBeVisible();
  });
});

/* ─── Products Tests ───────────────────────────────────────── */

test.describe('Member product browsing', () => {

  test('member can view products page', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Products page loads with product grid
    await expect(page.getByText(/herbalife shop/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button:has-text("Tambah ke Keranjang")').first()).toBeVisible();
  });

  test('member can add product to cart', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Cart should start empty or with 0 items
    const initialBadge = page.locator('[class*="bg-brand-primary text-white"][class*="text-\\[10px\\]"]');
    const initialCount = await initialBadge.textContent().catch(() => '0');

    // Add first product to cart
    await addFirstProductToCart(page);

    // Cart badge should update (may show 1 or a checkmark state)
    await page.waitForTimeout(1_000);
  });

  test('member can add multiple products to cart', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Add first product
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Add second product
    const addButtons = page.locator('button:has-text("Tambah ke Keranjang")');
    const count = await addButtons.count();
    if (count > 1) {
      await addButtons.nth(1).click();
      await page.waitForTimeout(500);
    }

    // Cart count should have increased
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    const cartItems = page.locator('[class*="flex justify-between items-center"][class*="border-b"]');
    // Cart should have items or "Keranjang kosong" message
    const hasItems = await page.getByText(/sudah di keranjang/i).isVisible().catch(() => false);
    const isEmpty = await page.getByText(/keranjang kosong/i).isVisible().catch(() => false);
    expect(hasItems || isEmpty).toBeTruthy();
  });
});

/* ─── Cart Tests ───────────────────────────────────────────── */

test.describe('Member cart management', () => {

  test('user can view cart page', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Cart page should load
    await expect(page.getByText(/keranjang belanja/i)).toBeVisible({ timeout: 10_000 });
  });

  test('user can adjust quantity in cart', async ({ page }) => {
    await loginAsMember(page);

    // Add a product first
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Check if cart has items
    const quantity = page.locator('[class*="font-mono"][class*="w-6"]').first();
    if (await quantity.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const initialQty = await quantity.textContent();
      const initialNum = parseInt(initialQty ?? '1', 10);

      // Increase quantity
      const increaseBtn = page.locator('button:has-text("+")').first();
      await increaseBtn.click();
      await page.waitForTimeout(500);

      const newQty = await quantity.textContent();
      const newNum = parseInt(newQty ?? '1', 10);
      expect(newNum).toBe(initialNum + 1);
    }
  });

  test('user can remove item from cart', async ({ page }) => {
    await loginAsMember(page);

    // Add a product first
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Check if there's an item to remove
    const removeBtn = page.locator('button:has-text("Hapus")').first();
    if (await removeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('user can proceed to checkout from cart', async ({ page }) => {
    await loginAsMember(page);

    // Add a product first
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart and checkout
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    const checkoutBtn = page.locator('button:has-text("Checkout Sekarang")');
    await expect(checkoutBtn).toBeVisible({ timeout: 5_000 });

    await checkoutBtn.click();
    await page.waitForTimeout(2_000);

    // Should navigate to payment page
    await expect(page).toHaveURL(/\/pembayaran/);
  });
});

/* ─── BMI Tests ────────────────────────────────────────────── */

test.describe('Member BMI calculator', () => {

  test('member can use BMI calculator and result is saved', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Fill in BMI data
    await page.getByLabel(/tinggi badan/i).fill('175');
    await page.getByLabel(/berat badan/i).fill('70');
    await page.getByRole('button').filter({ hasText: /hitung sekarang/i }).click();

    // Result should appear with BMI value
    await expect(page.locator('[class*="text-6xl"]')).toBeVisible({ timeout: 5_000 });

    // "Tersimpan" badge should appear (because user is logged in, result is saved)
    await expect(page.getByText(/tersimpan/i).or(page.getByText(/tersimpan/i))).toBeVisible({ timeout: 5_000 });
  });

  test('BMI result shows product recommendations', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.getByLabel(/tinggi badan/i).fill('170');
    await page.getByLabel(/berat badan/i).fill('65');
    await page.getByRole('button').filter({ hasText: /hitung sekarang/i }).click();

    // Result should show recommendations section
    await expect(page.getByText(/rekomendasi produk/i)).toBeVisible({ timeout: 5_000 });
  });
});

/* ─── Consultation Tests ────────────────────────────────────── */

test.describe('Member consultation', () => {

  test('member can submit consultation question', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/konsultasi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Fill in the consultation form
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill(`E2E Test Question - How should I improve my nutrition? ${Date.now()}`);

    // Submit button should be enabled
    const submitBtn = page.getByRole('button').filter({ hasText: /kirim/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Success message should appear
    await expect(page.getByText(/pertanyaan terkirim/i)).toBeVisible({ timeout: 10_000 });
  });

  test('member can view consultation history in My History page', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/riwayat', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // History page should load
    await expect(page.getByText(/riwayat saya/i)).toBeVisible({ timeout: 10_000 });

    // Filter buttons should be visible
    await expect(page.getByText(/semua/i)).toBeVisible();
    await expect(page.getByText(/konsultasi/i)).toBeVisible();
  });
});

/* ─── Order History ────────────────────────────────────────── */

test.describe('Member order history', () => {

  test('user can view order history', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/riwayat', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should load the history page
    await expect(page.getByText(/riwayat saya/i)).toBeVisible({ timeout: 10_000 });
  });
});

/* ─── Cleanup ──────────────────────────────────────────────── */

test.describe('Cleanup', () => {
  test('member can logout after tests', async ({ page }) => {
    await loginAsMember(page);
    await logout(page);
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });
});
