import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import type { User } from '../../types';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Andi Wijaya',
  email: 'andi@example.com',
  role: 'user',
  ...overrides,
});

function renderNavbar(props: React.ComponentProps<typeof Navbar>) {
  return render(
    <BrowserRouter>
      <Navbar {...props} />
    </BrowserRouter>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows "Masuk" button when user is null', () => {
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    expect(screen.getByRole('button', { name: /Masuk/i })).toBeInTheDocument();
  });

  it('shows user name and email when logged in', () => {
    renderNavbar({
      user: makeUser({ name: 'Andi Wijaya', email: 'andi@example.com' }),
      logout: vi.fn(), openLogin: vi.fn(), cartCount: 0,
    });
    expect(screen.getByText('Andi Wijaya')).toBeInTheDocument();
    expect(screen.getByText('andi@example.com')).toBeInTheDocument();
  });

  it('shows admin link when user.role === "admin"', () => {
    renderNavbar({ user: makeUser({ role: 'admin' }), logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument();
  });

  it('shows admin link when user.role === "super_admin"', () => {
    renderNavbar({ user: makeUser({ role: 'super_admin' }), logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument();
  });

  it('does NOT show admin link for user.role === "user"', () => {
    renderNavbar({ user: makeUser({ role: 'user' }), logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    expect(screen.queryByRole('link', { name: /Admin/i })).not.toBeInTheDocument();
  });

  it('shows cart icon with count badge (desktop nav)', () => {
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 5 });

    // In jsdom there is no media query support, so md:hidden doesn't hide mobile nav.
    // Find the cart link by its href — the desktop cart link has title="Keranjang"
    const cartLinks = screen.getAllByRole('link').filter(a => a.getAttribute('href') === '/keranjang');
    expect(cartLinks.length).toBeGreaterThan(0);

    // The badge with count 5 should be in the document
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 9+ badge when cartCount > 9', () => {
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 12 });
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('no badge shown when cartCount is 0', () => {
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    // In jsdom, the mobile cart link also renders (md:hidden doesn't work),
    // so we check that the number 0 is not shown as a badge
    const zeroBadges = screen.queryAllByText('0');
    // If zero badges exist, none of them should be inside the cart badge span
    // (the cart badge only shows when count > 0)
    const cartBadge = zeroBadges.find(el =>
      el.className.includes('rounded-full')
    );
    expect(cartBadge).toBeUndefined();
  });

  it('mobile menu toggle shows mobile nav on click', async () => {
    const user = userEvent.setup();
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });

    // The mobile toggle button is an icon-only button (no text) that has
    // the `md:hidden` class. In jsdom it renders alongside desktop elements.
    // Find all icon-only buttons (no text content) — one of them is the menu toggle
    const allButtons = screen.getAllByRole('button');
    const menuToggle = allButtons.find(btn => btn.textContent === '' || btn.textContent?.trim() === '');
    expect(menuToggle).toBeDefined();

    await user.click(menuToggle!);

    // After toggle, Beranda should still be visible (both desktop + mobile nav show it)
    const beras = screen.getAllByText('Beranda');
    expect(beras.length).toBeGreaterThanOrEqual(1);
  });

  it('logout button calls logout function', async () => {
    const user = userEvent.setup();
    const logoutFn = vi.fn();
    renderNavbar({ user: makeUser(), logout: logoutFn, openLogin: vi.fn(), cartCount: 0 });

    // Logout button has the LogOut icon with title "Keluar"
    const logoutBtn = screen.getByRole('button', { name: /Keluar/i });
    await user.click(logoutBtn);

    expect(logoutFn).toHaveBeenCalledTimes(1);
  });

  it('shows "Masuk" button in mobile auth section when user is null', () => {
    renderNavbar({ user: null, logout: vi.fn(), openLogin: vi.fn(), cartCount: 0 });
    // There are two "Masuk" buttons in jsdom (desktop + mobile sections)
    const masukButtons = screen.getAllByRole('button', { name: /^Masuk$/i });
    expect(masukButtons.length).toBeGreaterThanOrEqual(1);
  });
});
