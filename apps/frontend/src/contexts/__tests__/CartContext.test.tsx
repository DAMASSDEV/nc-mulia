import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../CartContext';
import type { User } from '../../types';
import * as api from '../../lib/api';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  membershipStatus: 'regular',
  ...overrides,
});

// ── Harness: reads cart state from context ────────────────────────────────────
function Harness({ children }: { children?: React.ReactNode }) {
  const ctx = useCart();
  return (
    <div>
      <span data-testid="cart-count">{ctx.cartCount}</span>
      <span data-testid="cart-length">{ctx.cart.length}</span>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <span data-testid="error">{ctx.error ?? 'null'}</span>
      {ctx.cart.map(item => (
        <span key={item.product.id} data-testid={`item-${item.product.id}`}>{item.qty}</span>
      ))}
      {children}
    </div>
  );
}

// ── ActionHarness: a child that uses useCart and exposes action buttons ────────
// This follows the correct React pattern: hooks are called at the top level.
function ActionHarness({ action }: { action: 'addToCart' | 'updateQty' | 'removeFromCart' | 'clearCart' | 'checkout' | 'addToCart2' | 'checkIsInCart' }) {
  const ctx = useCart();

  if (action === 'addToCart') {
    return (
      <button data-testid="add-btn" onClick={() => ctx.addToCart({ id: 'g1', name: 'Guest Product', price: 75000 }, 1)}>
        Add
      </button>
    );
  }
  if (action === 'addToCart2') {
    return (
      <button data-testid="add-existing" onClick={() => ctx.addToCart({ id: 'g2', name: 'Existing', price: 80000 }, 2)}>
        Add Existing
      </button>
    );
  }
  if (action === 'updateQty') {
    return (
      <button data-testid="update-btn" onClick={() => ctx.updateQty('uq1', 5)}>
        Update
      </button>
    );
  }
  if (action === 'removeFromCart') {
    return (
      <button data-testid="remove-btn" onClick={() => ctx.removeFromCart('r1')}>
        Remove
      </button>
    );
  }
  if (action === 'clearCart') {
    return (
      <button data-testid="clear-btn" onClick={() => ctx.clearCart()}>
        Clear
      </button>
    );
  }
  if (action === 'checkout') {
    return (
      <button data-testid="checkout-btn" onClick={() => ctx.checkout()}>
        Checkout
      </button>
    );
  }
  return <button data-testid="noop">Noop</button>;
}

// ── CheckoutResult: captures checkout result in state ────────────────────────
function CheckoutResult({ onResult }: { onResult: (r: { success: boolean; message: string }) => void }) {
  const ctx = useCart();
  return (
    <button
      data-testid="checkout-guest"
      onClick={async () => {
        const r = await ctx.checkout();
        onResult(r);
      }}
    >
      Checkout
    </button>
  );
}

// ── AddThenCheck: adds item then checks isInCart ──────────────────────────────
function AddThenCheck({ onDone }: { onDone: (inCart: boolean) => void }) {
  const ctx = useCart();
  return (
    <button
      data-testid="check-incart"
      onClick={async () => {
        await ctx.addToCart({ id: 'in-cart-1', name: 'In Cart', price: 100 }, 1);
        onDone(ctx.isInCart('in-cart-1'));
      }}
    >
      Check
    </button>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it('starts with empty cart', () => {
    render(
      <CartProvider user={null}>
        <Harness />
      </CartProvider>
    );
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
  });

  it('guest user loads cart from localStorage', () => {
    const savedCart = [
      {
        product: { id: 'p1', name: 'Product 1', price: 100000 },
        qty: 2,
        basePrice: 100000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 100000,
        subtotal: 200000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    render(
      <CartProvider user={null}>
        <Harness />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    expect(screen.getByTestId('item-p1')).toHaveTextContent('2');
  });

  // ── addToCart ─────────────────────────────────────────────────────────────

  it('addToCart: guest updates localStorage', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <ActionHarness action="addToCart" />
        </Harness>
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
    expect(localStorage.getItem('nc_mulia_guest_cart')).toContain('g1');
  });

  it('addToCart: guest increments existing item quantity', async () => {
    const savedCart = [
      {
        product: { id: 'g2', name: 'Existing', price: 80000 },
        qty: 1,
        basePrice: 80000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 80000,
        subtotal: 80000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <ActionHarness action="addToCart2" />
        </Harness>
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-existing'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    });
  });

  // ── updateQty ─────────────────────────────────────────────────────────────

  it('updateQty: guest updates localStorage', async () => {
    const savedCart = [
      {
        product: { id: 'uq1', name: 'Update Qty', price: 50000 },
        qty: 1,
        basePrice: 50000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 50000,
        subtotal: 50000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <ActionHarness action="updateQty" />
        </Harness>
      </CartProvider>
    );

    await user.click(screen.getByTestId('update-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('5');
    });
    const stored = JSON.parse(localStorage.getItem('nc_mulia_guest_cart')!);
    expect(stored[0].qty).toBe(5);
  });

  // ── removeFromCart ────────────────────────────────────────────────────────

  it('removeFromCart: guest removes item from localStorage', async () => {
    const savedCart = [
      {
        product: { id: 'r1', name: 'Remove Me', price: 50000 },
        qty: 2,
        basePrice: 50000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 50000,
        subtotal: 100000,
      },
      {
        product: { id: 'r2', name: 'Keep Me', price: 30000 },
        qty: 1,
        basePrice: 30000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 30000,
        subtotal: 30000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <ActionHarness action="removeFromCart" />
        </Harness>
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('3');

    await user.click(screen.getByTestId('remove-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
    const stored = JSON.parse(localStorage.getItem('nc_mulia_guest_cart')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].product.id).toBe('r2');
  });

  // ── checkout ───────────────────────────────────────────────────────────────

  it('checkout returns checkout_requires_login for guests', async () => {
    const savedCart = [
      {
        product: { id: 'c1', name: 'Checkout Item', price: 50000 },
        qty: 1,
        basePrice: 50000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 50000,
        subtotal: 50000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    let capturedResult: { success: boolean; message: string } | null = null;
    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <CheckoutResult onResult={(r) => { capturedResult = r; }} />
        </Harness>
      </CartProvider>
    );

    await user.click(screen.getByTestId('checkout-guest'));

    await waitFor(() => {
      expect(capturedResult).not.toBeNull();
    });
    expect(capturedResult!.message).toBe('checkout_requires_login');
  });

  it('checkout calls transactionApi.create for logged-in users', async () => {
    const createSpy = vi.spyOn(api.transactionApi, 'create').mockResolvedValue({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      data: { id: 'tx-123' } as any,
    });
    // cartApi.get must return items so cart is not empty when checkout is called
    vi.spyOn(api.cartApi, 'get').mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [
        {
          productId: 'ck1',
          productName: 'Checkout Product',
          quantity: 2,
          basePrice: 100000,
          discountPercentage: 0,
          discountAmount: 0,
          finalUnitPrice: 100000,
          subtotal: 200000,
        },
      ],
    });

    const user = userEvent.setup();

    render(
      <CartProvider user={makeUser()}>
        <Harness>
          <ActionHarness action="checkout" />
        </Harness>
      </CartProvider>
    );

    // Wait for the initial cart load to resolve
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    }, { timeout: 2000 });

    await user.click(screen.getByTestId('checkout-btn'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('checkout clears cart after successful transaction', async () => {
    const savedCart = [
      {
        product: { id: 'clr1', name: 'Clear Me', price: 50000 },
        qty: 1,
        basePrice: 50000,
        discountPercentage: 0,
        discountAmount: 0,
        finalUnitPrice: 50000,
        subtotal: 50000,
      },
    ];
    localStorage.setItem('nc_mulia_guest_cart', JSON.stringify(savedCart));

    const user = userEvent.setup();

    render(
      <CartProvider user={null}>
        <Harness>
          <ActionHarness action="clearCart" />
        </Harness>
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    await user.click(screen.getByTestId('clear-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });
    expect(localStorage.getItem('nc_mulia_guest_cart')).toBeNull();
  });

  it('isInCart returns true when product is in cart', async () => {
    const user = userEvent.setup();
    let captured = false;

    render(
      <CartProvider user={null}>
        <Harness>
          <AddThenCheck onDone={(v) => { captured = v; }} />
        </Harness>
      </CartProvider>
    );

    await user.click(screen.getByTestId('check-incart'));

    await waitFor(() => {
      expect(screen.getByTestId('item-in-cart-1')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('item-not-in-cart')).toBeNull();
  });

  // ── Logged-in user loads from API ─────────────────────────────────────────

  it('logged-in user fetches cart from API on mount', async () => {
    const getSpy = vi.spyOn(api.cartApi, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [
        {
          productId: 'api-p1',
          productName: 'API Product',
          quantity: 3,
          basePrice: 50000,
          discountPercentage: 0,
          discountAmount: 0,
          finalUnitPrice: 50000,
          subtotal: 150000,
        },
      ],
    });

    render(
      <CartProvider user={makeUser()}>
        <Harness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    });
    expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
  });
});
