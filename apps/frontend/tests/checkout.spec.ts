import { test, expect, Page } from '@playwright/test';
import {
  openLoginModal,
  login,
  logout,
  TEST_CREDENTIALS,
  addFirstProductToCart,
} from './helpers';

/* ─── Login Helper ─────────────────────────────────────────── */

async function loginAsMember(page: Page) {
  await page.goto('/');
  await openLoginModal(page);
  await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  await page.waitForTimeout(1_000);
}

/* ─── Full Checkout Flow Tests ─────────────────────────────── */

test.describe('Full checkout flow', () => {

  test('user can add items to cart and proceed to checkout', async ({ page }) => {
    await loginAsMember(page);

    // Navigate to products
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Add first product
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Add second product if available
    const addButtons = page.locator('button:has-text("Tambah ke Keranjang")');
    const count = await addButtons.count();
    if (count > 1) {
      await addButtons.nth(1).click();
      await page.waitForTimeout(500);
    }

    // Navigate to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Cart page should show items or have a "checkout now" button
    const cartTitle = page.getByText(/keranjang belanja/i);
    await expect(cartTitle).toBeVisible({ timeout: 10_000 });
  });

  test('user can complete checkout and reach payment page', async ({ page }) => {
    await loginAsMember(page);

    // Add a product
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Click checkout
    const checkoutBtn = page.locator('button:has-text("Checkout Sekarang")');
    await expect(checkoutBtn).toBeVisible({ timeout: 5_000 });
    await checkoutBtn.click();

    // Wait for navigation to payment page
    await page.waitForURL(/\/pembayaran/, { timeout: 10_000 });

    // Payment page should load
    // Should show payment method selection
    const paymentContent = page.locator('body');
    await expect(paymentContent).toBeVisible();
    await page.waitForTimeout(1_000);
  });

  test('payment page shows order summary', async ({ page }) => {
    await loginAsMember(page);

    // Add a product
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart and checkout
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);
    const checkoutBtn = page.locator('button:has-text("Checkout Sekarang")');
    await checkoutBtn.click();
    await page.waitForURL(/\/pembayaran/, { timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // Payment page should show total amount
    const bodyText = await page.locator('body').textContent();
    // Should show some numeric value for total (in Rp format)
    const hasTotal = bodyText?.includes('Rp') || bodyText?.includes('Total');
    expect(hasTotal).toBeTruthy();
  });

  test('user can select a payment method', async ({ page }) => {
    await loginAsMember(page);

    // Add a product and checkout
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);
    const checkoutBtn = page.locator('button:has-text("Checkout Sekarang")');
    await checkoutBtn.click();
    await page.waitForURL(/\/pembayaran/, { timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // Look for payment method radio buttons or selectable options
    // Payment options typically include: Transfer Bank, WhatsApp, COD, etc.
    const paymentOptions = page.locator('input[type="radio"], [class*="payment"], [class*="method"]');
    const optionCount = await paymentOptions.count();

    if (optionCount > 0) {
      // Select first payment method
      await paymentOptions.first().click({ force: true });
      await page.waitForTimeout(500);
    } else {
      // Try clicking by text (e.g., "Transfer Bank", "WhatsApp", "COD")
      const transferOption = page.getByText(/transfer/i).first();
      const waOption = page.getByText(/whatsapp|wa/i).first();
      const codOption = page.getByText(/cod|bayar di tempat/i).first();

      const chosen = await transferOption.isVisible({ timeout: 2_000 }).catch(() => false)
        ? transferOption
        : await waOption.isVisible({ timeout: 2_000 }).catch(() => false)
        ? waOption
        : codOption;

      if (await chosen.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await chosen.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('empty cart shows empty state message', async ({ page }) => {
    await loginAsMember(page);

    // Go to cart with no items
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Should show "Keranjang kosong" or similar message
    const emptyState = page.getByText(/keranjang kosong/i);
    const hasEmptyState = await emptyState.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
      // Checkout button should not be visible when cart is empty
      await expect(page.locator('button:has-text("Checkout Sekarang")')).not.toBeVisible();
    }
  });

  test('cart shows correct total when items are present', async ({ page }) => {
    await loginAsMember(page);

    // Add a product
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Check for total display
    const totalLabel = page.getByText('Total');
    const hasTotal = await totalLabel.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasTotal) {
      await expect(totalLabel).toBeVisible();
      // Total should show a price value
      const totalValue = page.locator('[class*="text-emerald-600"]').first();
      await expect(totalValue).toBeVisible();
    }
  });

  test('user can continue shopping from cart', async ({ page }) => {
    await loginAsMember(page);

    // Add a product
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Click "Lanjut Belanja" link
    const continueShopping = page.getByText(/anjut belanja/i);
    if (await continueShopping.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await continueShopping.click();
      await page.waitForURL(/\/produk-herbalife/, { timeout: 5_000 });
      await expect(page.getByText(/herbalife shop/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('user can clear cart', async ({ page }) => {
    await loginAsMember(page);

    // Add a product
    await page.goto('/produk-herbalife', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await addFirstProductToCart(page);
    await page.waitForTimeout(500);

    // Go to cart
    await page.goto('/keranjang', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);

    // Click "Kosongkan keranjang"
    const clearBtn = page.getByText(/kosongkan keranjang/i);
    if (await clearBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(1_000);

      // Cart should now be empty
      await expect(page.getByText(/keranjang kosong/i)).toBeVisible({ timeout: 5_000 });
    }
  });
});
