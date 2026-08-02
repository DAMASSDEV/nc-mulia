import { test, expect } from '@playwright/test';
import {
  login,
  logout,
  openLoginModal,
  TEST_CREDENTIALS,
  uniqueEmail,
  waitForPageLoad,
} from './helpers';

/* ─── Guest Tests ─────────────────────────────────────────── */

test.describe('Guest (unauthenticated) users', () => {

  test('guest sees Masuk button in navbar', async ({ page }) => {
    await page.goto('/');

    // The "Masuk" button should be visible in the navbar
    const masukButton = page.getByRole('button', { name: 'Masuk' });
    await expect(masukButton).toBeVisible();
  });

  test('guest can open login modal by clicking Masuk button', async ({ page }) => {
    await page.goto('/');

    await openLoginModal(page);

    // Login form should appear with email and password fields
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('guest sees login form fields when modal is open', async ({ page }) => {
    await page.goto('/');

    await openLoginModal(page);

    // Verify modal title
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();

    // Verify email and password inputs are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Submit button should say "Masuk"
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });

  test('guest can switch to registration form', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    // Click the register link inside the modal
    await page.getByText('Daftar di sini').click();

    // Registration form should appear
    await expect(page.getByRole('heading', { name: 'Daftar Akun' })).toBeVisible();
    await expect(page.getByLabel('Nama Lengkap')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daftar' })).toBeVisible();
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    // Fill in wrong credentials
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Masuk' }).last().click();

    // Error message should appear
    await expect(
      page.locator('[class*="bg-danger-soft"]').or(page.locator('[class*="text-danger"]'))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('guest can register a new account with unique email', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    // Switch to register form
    await page.getByText('Daftar di sini').click();

    // Fill registration form
    const email = uniqueEmail();
    await page.getByLabel('Nama Lengkap').fill('E2E Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Daftar' }).click();

    // After successful registration, the login modal should open
    // with the email pre-filled
    await page.waitForTimeout(1_000);

    // The registration form should close and login form opens
    // The email field in the login form should be pre-filled
    const loginEmail = page.getByLabel('Email');
    await expect(loginEmail).toBeVisible({ timeout: 5_000 });
    const emailValue = await loginEmail.inputValue();
    expect(emailValue).toBe(email);
  });
});

/* ─── Login Tests ─────────────────────────────────────────── */

test.describe('User authentication', () => {

  test('user can login with valid admin credentials', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

    // After login, the username should appear in the navbar
    await expect(page.getByText(TEST_CREDENTIALS.admin.email)).toBeVisible({ timeout: 10_000 });
  });

  test('user can login with valid member credentials', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);

    // After login, the user name should appear in the navbar
    await expect(page.getByText(TEST_CREDENTIALS.user.email)).toBeVisible({ timeout: 10_000 });
  });

  test('login modal closes after successful login', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

    // The modal (dialog) should no longer be present in the DOM
    await page.waitForFunction(
      () => !document.querySelector('[class*="fixed inset-0 z-[70]"]'),
      { timeout: 10_000 }
    );
  });

  test('after login, username appears in navbar', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);

    // User info block should be visible in navbar
    // The user name "Syam" should be visible
    const userNameElement = page.locator('[class*="font-medium text-foreground"]').first();
    await expect(userNameElement).toBeVisible({ timeout: 10_000 });
  });

  test('admin link appears in navbar after admin login', async ({ page }) => {
    await page.goto('/');
    await openLoginModal(page);

    await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

    // Admin button should appear in navbar
    const adminLink = page.getByText('Admin');
    await expect(adminLink).toBeVisible({ timeout: 10_000 });
  });
});

/* ─── Logout Tests ────────────────────────────────────────── */

test.describe('User logout', () => {

  test('user can logout', async ({ page }) => {
    // Login first
    await page.goto('/');
    await openLoginModal(page);
    await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
    await page.waitForTimeout(1_000);

    // Now logout
    await logout(page);

    // The "Masuk" button should be visible again
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });

  test('admin can logout', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await openLoginModal(page);
    await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
    await page.waitForTimeout(1_000);

    // Logout
    await logout(page);

    // The "Masuk" button should be visible again
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });

  test('after logout, user cannot access protected routes', async ({ page }) => {
    // Login then logout
    await page.goto('/');
    await openLoginModal(page);
    await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
    await page.waitForTimeout(1_000);
    await logout(page);

    // Try to access a protected route
    await page.goto('/dashboard');
    await page.waitForTimeout(1_000);

    // Should redirect to home page (since user is not authenticated)
    // The page should either show "Masuk" button or redirect to home
    await expect(page.getByRole('button', { name: 'Masuk' }).or(page.getByRole('heading').filter({ hasText: /solusi/i }))).toBeVisible({ timeout: 5_000 });
  });
});
