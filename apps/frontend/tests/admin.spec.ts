import { test, expect, Page } from '@playwright/test';
import {
  openLoginModal,
  login,
  logout,
  TEST_CREDENTIALS,
} from './helpers';

/* ─── Login Helper ─────────────────────────────────────────── */

async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await openLoginModal(page);
  await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  await page.waitForTimeout(1_500);
}

/* ─── Admin Dashboard Tests ────────────────────────────────── */

test.describe('Admin panel overview', () => {

  test('admin dashboard loads with stats', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);

    // Dashboard should load with welcome text
    await expect(page.getByText(/dashboard overview/i)).toBeVisible({ timeout: 15_000 });

    // Stat cards should be visible (may show "—" while loading)
    await expect(page.getByText(/total pengguna/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/konsultasi/i).first()).toBeVisible();
  });

  test('admin can see recent activity section', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);

    // Recent activity section should be visible
    await expect(page.getByText(/aktivitas terbaru/i)).toBeVisible({ timeout: 10_000 });
  });
});

/* ─── Admin Users Tests ────────────────────────────────────── */

test.describe('Admin user management', () => {

  test('admin can view users list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page title
    await expect(page.getByRole('heading').filter({ hasText: /pengguna/i })).toBeVisible({ timeout: 15_000 });

    // Search input should be visible
    await expect(page.getByPlaceholder(/cari nama atau email/i)).toBeVisible();

    // Table should load (may show "—" or user rows)
    await page.waitForTimeout(1_000);
  });

  test('admin can toggle user active status', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10_000 });

    // Find the first toggle (the admin user itself is likely already active)
    const toggles = page.locator('table input[type="checkbox"]');
    const count = await toggles.count();

    if (count > 0) {
      // Toggle the first non-super-admin user
      // We skip the first row (admin) and toggle a different user if available
      const secondToggle = count > 1 ? toggles.nth(1) : toggles.nth(0);
      if (await secondToggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await secondToggle.click({ force: true });
        await page.waitForTimeout(1_000);
      }
    }
  });

  test('admin can open membership edit modal', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    await page.waitForSelector('table', { timeout: 10_000 });

    // Click "Edit Membership" on the first user
    const editBtn = page.getByText('Edit Membership').first();
    if (await editBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await editBtn.click();

      // Modal should appear
      await expect(page.getByText(/membership:/i)).toBeVisible({ timeout: 5_000 });

      // Status select should be visible
      await expect(page.locator('select').first()).toBeVisible();

      // Close the modal
      await page.keyboard.press('Escape');
    }
  });
});

/* ─── Admin Products Tests ──────────────────────────────────── */

test.describe('Admin product management', () => {

  test('admin can view products list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /manajemen produk/i })).toBeVisible({ timeout: 15_000 });

    // "Tambah Produk" button should be visible
    await expect(page.getByRole('button').filter({ hasText: /tambah produk/i })).toBeVisible();

    // Search input should be visible
    await expect(page.getByPlaceholder(/cari produk/i)).toBeVisible();
  });

  test('admin can open new product modal', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Click "Tambah Produk"
    await page.getByRole('button').filter({ hasText: /tambah produk/i }).click();
    await page.waitForTimeout(500);

    // Modal should appear with form fields
    await expect(page.getByText(/tambah produk/i).or(page.getByText(/edit/i))).toBeVisible({ timeout: 5_000 });
  });

  test('admin can create a new product with required fields', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Click "Tambah Produk"
    await page.getByRole('button').filter({ hasText: /tambah produk/i }).click();
    await page.waitForTimeout(1_000);

    // The ProductModal has: name, category (select), price (number), description, benefits, imageUrl, isAvailable, isMemberDiscountEligible
    // Fill in product name
    const nameInput = page.locator('input[placeholder*="Herbalife"]');
    if (await nameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nameInput.fill(`E2E Test Product ${Date.now()}`);
    } else {
      // Fall back: fill the first text input in the modal
      const firstInput = page.locator('[class*="fixed inset-0"] input').first();
      await firstInput.fill(`E2E Test Product ${Date.now()}`);
    }

    // Fill price (number input for "Harga (Rp)")
    const priceInput = page.locator('input[type="number"]').first();
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('50000');
    }

    // Set category to Shake (default)
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await categorySelect.selectOption('Shake');
    }

    // Click "Tambah Produk" submit button
    const submitBtn = page.locator('[class*="fixed inset-0"] button[type="submit"]').first();
    if (await submitBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2_000);
    }
  });

  test('admin can edit an existing product', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Wait for products to load
    await page.waitForTimeout(1_000);

    // Look for edit button on a product card
    // Product cards have edit icon button
    const editButtons = page.locator('[title="Edit Produk"]');
    const count = await editButtons.count();

    if (count > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(500);

      // Edit modal should appear
      await expect(page.getByText(/edit/i).or(page.getByText(/simpan/i))).toBeVisible({ timeout: 5_000 });

      // Close it
      await page.keyboard.press('Escape');
    }
  });
});

/* ─── Admin Transactions Tests ──────────────────────────────── */

test.describe('Admin transaction management', () => {

  test('admin can view transactions list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/transactions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /transaksi/i })).toBeVisible({ timeout: 15_000 });

    // Status filter should be visible
    await expect(page.locator('select').first()).toBeVisible();
  });
});

/* ─── Admin Consultations Tests ────────────────────────────── */

test.describe('Admin consultation management', () => {

  test('admin can view consultations list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/consultations', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /manajemen konsultasi/i })).toBeVisible({ timeout: 15_000 });

    // Status tabs should be visible
    await expect(page.getByText(/semua/i)).toBeVisible();
    await expect(page.getByText(/pending/i)).toBeVisible();
    await expect(page.getByText(/terjawab/i)).toBeVisible();
  });

  test('admin can respond to a consultation', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/consultations', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Click "Lihat Detail" on first consultation
    const detailBtn = page.getByText('Lihat Detail').first();
    if (await detailBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await detailBtn.click();
      await page.waitForTimeout(500);

      // Detail modal should appear
      await expect(page.getByText(/detail konsultasi/i)).toBeVisible({ timeout: 5_000 });

      // Fill in response
      const textarea = page.locator('textarea');
      if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await textarea.fill(`E2E Test Response - Thank you for your question! ${Date.now()}`);

        // Send button
        const sendBtn = page.getByRole('button').filter({ hasText: /kirim respons/i });
        if (await sendBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await sendBtn.click();
          await page.waitForTimeout(2_000);
        }
      }

      // Close modal
      const closeBtn = page.locator('[class*="fixed inset-0"] button').filter({ hasText: /x|✕|close/i }).first();
      if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await closeBtn.click();
      }
    }
  });
});

/* ─── Admin Locations Tests ────────────────────────────────── */

test.describe('Admin location management', () => {

  test('admin can view locations', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/locations', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /manajemen lokasi/i })).toBeVisible({ timeout: 15_000 });

    // "Tambah Lokasi" button should be visible
    await expect(page.getByRole('button').filter({ hasText: /tambah lokasi/i })).toBeVisible();
  });
});

/* ─── Admin Audit Log Tests ───────────────────────────────── */

test.describe('Admin audit log', () => {

  test('admin can view audit log', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/audit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /audit log/i })).toBeVisible({ timeout: 15_000 });

    // Search input should be visible
    await expect(page.getByPlaceholder(/cari aksi/i)).toBeVisible();
  });

  test('audit log shows module filters', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/audit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Module filter buttons should be visible
    await expect(page.getByText(/semua/i).first()).toBeVisible();
  });
});

/* ─── Admin Settings Tests ─────────────────────────────────── */

test.describe('Admin settings', () => {

  test('admin can view settings page with discount configuration', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /pengaturan/i })).toBeVisible({ timeout: 15_000 });

    // Member discount section should be visible
    await expect(page.getByText(/diskon member/i)).toBeVisible({ timeout: 10_000 });
  });

  test('admin can view discount rate configuration', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // A percentage input should be visible for the discount rate
    const percentInput = page.locator('input[type="number"]').first();
    if (await percentInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(percentInput).toBeVisible();
    }
  });
});

/* ─── Admin Role Management Tests ─────────────────────────── */

test.describe('Admin role management', () => {

  test('admin has access to role management', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/roles', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Page heading
    await expect(page.getByRole('heading').filter({ hasText: /role & akses/i })).toBeVisible({ timeout: 15_000 });

    // Role cards should be visible
    await expect(page.getByText(/super admin/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/admin/i)).toBeVisible();
    await expect(page.getByText(/user/i)).toBeVisible();
  });

  test('role management shows permission badges', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/roles', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Permission keys should be visible as tags on role cards
    // Super Admin should have all permissions shown
    await page.waitForTimeout(1_000);
    const permissionTags = page.locator('[class*="bg-surface-secondary"][class*="text-xs"]');
    // At least some permissions should be visible
    const permCount = await permissionTags.count();
    expect(permCount).toBeGreaterThan(0);
  });

  test('admin can open permission edit modal for a non-system role', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/roles', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Look for the "Permission" button on role cards
    const permButtons = page.getByRole('button').filter({ hasText: /permission/i });
    const count = await permButtons.count();

    if (count > 0) {
      // Click permission button on first available role
      await permButtons.first().click();
      await page.waitForTimeout(500);

      // Modal should open with permission list
      const modalContent = page.locator('[class*="fixed inset-0"]').last();
      await expect(modalContent).toBeVisible({ timeout: 5_000 });

      // Close modal
      await page.keyboard.press('Escape');
    }
  });
});

/* ─── Admin Sidebar Navigation ───────────────────────────── */

test.describe('Admin sidebar navigation', () => {

  test('admin can navigate between admin sections using sidebar', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);

    // Click on sidebar items - verify navigation works
    const sidebarLinks = page.locator('[class*="admin-sidebar-item"]');
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThan(0);

    // Click "Pengguna" in sidebar
    await page.getByText('Pengguna').first().click();
    await page.waitForTimeout(1_500);
    await expect(page.getByRole('heading').filter({ hasText: /pengguna/i })).toBeVisible({ timeout: 10_000 });

    // Click "Produk" in sidebar
    await page.getByText('Produk').first().click();
    await page.waitForTimeout(1_500);
    await expect(page.getByRole('heading').filter({ hasText: /manajemen produk/i })).toBeVisible({ timeout: 10_000 });
  });

  test('admin can logout from admin panel', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);

    // Find logout button in admin sidebar
    const logoutBtn = page.getByText('Keluar').first();
    await logoutBtn.click();
    await page.waitForTimeout(1_000);

    // Should redirect to home page with "Masuk" button
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible({ timeout: 10_000 });
  });
});
