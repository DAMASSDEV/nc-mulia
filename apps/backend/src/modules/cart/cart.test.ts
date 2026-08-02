import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, pricingMock } = vi.hoisted(() => {
  const m: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
  m.user = { findUnique: vi.fn() };
  m.product = { findUnique: vi.fn(), findMany: vi.fn() };
  m.cartItem = { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() };
  m.cartProduct = { findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), deleteMany: vi.fn() };
  return { mockPrisma: m, pricingMock: vi.fn().mockResolvedValue(0.30) };
});

vi.mock('../../lib/db.js', () => ({ prisma: mockPrisma }));

vi.mock('../../modules/pricing/index.js', () => ({
  getMemberDiscountRate: pricingMock,
  clearDiscountCache: vi.fn(),
}));

vi.mock('../../config/env.js', () => ({
  env: {
    NODE_ENV: 'test', PORT: '3000', FRONTEND_URL: 'http://localhost:5173',
    DATABASE_URL: 'mysql://test:test@localhost:3306/test',
    JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars-long',
    JWT_EXPIRES_IN: '7d', PAYMENT_SIMULATION_ENABLED: 'false',
  },
}));

import { CartService } from './service.js';

// ─────────────────────────────────────────────────────────────────────────────
// Cart Service tests
// ─────────────────────────────────────────────────────────────────────────────
describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pricingMock.mockResolvedValue(0.30);
  });

  // ── getCart ────────────────────────────────────────────────────────────────
  describe('getCart', () => {
    it('returns empty array when user has no cart', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);
      const svc = new CartService();
      expect(await svc.getCart('u1')).toEqual([]);
    });

    it('returns empty array when cart has no items', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ userId: 'u1', items: [] });
      const svc = new CartService();
      expect(await svc.getCart('u1')).toEqual([]);
    });

    it('returns formatted cart items with quantities', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({
        userId: 'u1',
        items: [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 1 }],
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
        { id: 'p2', name: 'Amino', price: 50000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart).toHaveLength(2);
      expect(cart[0]).toMatchObject({ productId: 'p1', quantity: 2, basePrice: 100000, discountPercentage: 0, finalUnitPrice: 100000, subtotal: 200000 });
    });
  });

  // ── formatCartItems — member discount ────────────────────────────────────
  describe('formatCartItems (member discount)', () => {
    it('applies 30% discount for active MEMBER users', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', membershipStatus: 'MEMBER',
        membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true,
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart[0]).toMatchObject({ discountPercentage: 30, discountAmount: 30000, finalUnitPrice: 70000, subtotal: 70000 });
    });

    it('uses getMemberDiscountRate (mocked) for discount calculation', async () => {
      await import('../../modules/pricing/index.js');
      pricingMock.mockImplementation(() => Promise.resolve(0.20));
      mockPrisma.cartItem.findUnique.mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', membershipStatus: 'MEMBER',
        membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true,
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart[0]).toMatchObject({ discountPercentage: 20, discountAmount: 20000, finalUnitPrice: 80000 });
    });

    it('does not apply discount when product is not member-discount eligible', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', membershipStatus: 'MEMBER',
        membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true,
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'Limited Item', price: 100000, isActive: true, isMemberDiscountEligible: false },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart[0]).toMatchObject({ discountPercentage: 0, discountAmount: 0, finalUnitPrice: 100000 });
    });

    it('does not apply discount for expired MEMBER', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', membershipStatus: 'MEMBER',
        membershipExpiresAt: new Date(Date.now() - 86400000), isActive: true,
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart[0]).toMatchObject({ discountPercentage: 0, discountAmount: 0, finalUnitPrice: 100000 });
    });

    it('filters out inactive/deleted products', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({
        userId: 'u1',
        items: [{ productId: 'p1', quantity: 1 }, { productId: 'p-deleted', quantity: 1 }],
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      const cart = await svc.getCart('u1');
      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe('p1');
    });
  });

  // ── addItem ────────────────────────────────────────────────────────────────
  describe('addItem', () => {
    it('creates cart if not exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', name: 'F1 Shake', isActive: true, price: 100000 });
      mockPrisma.cartItem.findUnique
        .mockResolvedValueOnce(null) // addItem first call: no cart
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1', items: [{ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 2 }] }); // getCart inside addItem
      mockPrisma.cartItem.create.mockResolvedValue({ id: 'cart1', userId: 'u1', items: [{ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 2 }] });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      await svc.addItem('u1', 'p1', 2);
      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
        data: { userId: 'u1', items: { create: { productId: 'p1', quantity: 2 } } },
        include: { items: true },
      });
    });

    it('upserts item if product already in cart', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', name: 'F1 Shake', isActive: true, price: 100000 });
      mockPrisma.cartItem.findUnique
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1' }) // addItem: cart exists
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1', items: [{ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 3 }] }); // getCart inside addItem
      mockPrisma.cartProduct.findUnique.mockResolvedValue({ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 1 });
      mockPrisma.cartProduct.update.mockResolvedValue({ id: 'cp1', quantity: 3 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      await svc.addItem('u1', 'p1', 2);
      expect(mockPrisma.cartProduct.update).toHaveBeenCalledWith({ where: { id: 'cp1' }, data: { quantity: 3 } });
      expect(mockPrisma.cartProduct.create).not.toHaveBeenCalled();
    });

    it('adds new product to existing cart', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p2', name: 'Amino', isActive: true, price: 50000 });
      mockPrisma.cartItem.findUnique
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1' }) // addItem: cart exists
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1', items: [{ id: 'cp2', cartItemId: 'cart1', productId: 'p2', quantity: 1 }] }); // getCart inside addItem
      mockPrisma.cartProduct.findUnique.mockResolvedValue(null);
      mockPrisma.cartProduct.create.mockResolvedValue({ id: 'cp2', cartItemId: 'cart1', productId: 'p2', quantity: 1 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p2', name: 'Amino', price: 50000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      await svc.addItem('u1', 'p2', 1);
      expect(mockPrisma.cartProduct.create).toHaveBeenCalledWith({ data: { cartItemId: 'cart1', productId: 'p2', quantity: 1 } });
    });

    it('throws 404 for inactive product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', name: 'Discontinued', isActive: false });
      const svc = new CartService();
      await expect(svc.addItem('u1', 'p1', 1)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const svc = new CartService();
      await expect(svc.addItem('u1', 'nonexistent', 1)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── updateItem ─────────────────────────────────────────────────────────────
  describe('updateItem', () => {
    it('updates quantity of existing item', async () => {
      mockPrisma.cartItem.findUnique
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1' }) // updateItem: cart exists
        .mockResolvedValueOnce({ id: 'cart1', userId: 'u1', items: [{ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 5 }] }); // getCart inside updateItem
      mockPrisma.cartProduct.findUnique.mockResolvedValue({ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 2 });
      mockPrisma.cartProduct.update.mockResolvedValue({ id: 'cp1', quantity: 5 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isMemberDiscountEligible: true },
      ]);
      const svc = new CartService();
      await svc.updateItem('u1', 'p1', 5);
      expect(mockPrisma.cartProduct.update).toHaveBeenCalledWith({ where: { id: 'cp1' }, data: { quantity: 5 } });
    });

    it('throws 404 when cart does not exist', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);
      const svc = new CartService();
      await expect(svc.updateItem('u1', 'p1', 5)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 404 when item not in cart', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ id: 'cart1', userId: 'u1' });
      mockPrisma.cartProduct.findUnique.mockResolvedValue(null);
      const svc = new CartService();
      await expect(svc.updateItem('u1', 'p-nonexistent', 5)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── removeItem ─────────────────────────────────────────────────────────────
  describe('removeItem', () => {
    it('removes item from cart', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue({ id: 'cart1', userId: 'u1', items: [{ id: 'cp1', cartItemId: 'cart1', productId: 'p1', quantity: 1 }] });
      mockPrisma.cartProduct.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.cartItem.findUnique.mockResolvedValueOnce({ id: 'cart1', userId: 'u1', items: [] });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([]);
      const svc = new CartService();
      const cart = await svc.removeItem('u1', 'p1');
      expect(mockPrisma.cartProduct.deleteMany).toHaveBeenCalledWith({ where: { cartItemId: 'cart1', productId: 'p1' } });
      expect(cart).toEqual([]);
    });

    it('handles no cart gracefully', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);
      const svc = new CartService();
      const cart = await svc.removeItem('u1', 'p1');
      expect(cart).toEqual([]);
      expect(mockPrisma.cartProduct.deleteMany).not.toHaveBeenCalled();
    });
  });

  // ── clear ──────────────────────────────────────────────────────────────────
  describe('clear', () => {
    it('deletes all cart items for user', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });
      const svc = new CartService();
      const result = await svc.clear('u1');
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
      expect(result).toEqual([]);
    });
  });
});
