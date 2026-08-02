import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => {
  const user = { findUnique: vi.fn() };
  const product = { findMany: vi.fn(), update: vi.fn() };
  const transaction = { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), update: vi.fn(), findUnique: vi.fn() };
  const $transaction = vi.fn().mockImplementation(async (fn: (tx: { user: typeof user; product: typeof product; transaction: typeof transaction }) => Promise<unknown>) => fn({ user, product, transaction }));
  return { user, product, transaction, $transaction };
});

vi.mock('../../lib/db.js', () => ({ prisma: mockPrisma }));

vi.mock('../../modules/pricing/index.js', () => ({
  getMemberDiscountRate: vi.fn().mockResolvedValue(0.30),
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

vi.mock('../../modules/audit/service.js', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { TransactionsService } from './service.js';

function makeTxResult(overrides: Record<string, any> = {}) {
  return {
    id: 'tx-new', userId: 'u1', membershipStatusSnapshot: 'REGULAR',
    normalTotal: 100000, totalDiscount: 0, finalTotal: 100000,
    status: 'PENDING', createdAt: new Date(), updatedAt: new Date(), items: [],
    ...overrides,
  };
}

function priceItem(p: any, qty: number, discountPct: number) {
  const base = p.price;
  const disc = Math.round(base * discountPct / 100);
  const final = base - disc;
  return {
    productId: p.id, productName: p.name, quantity: qty,
    basePrice: base, discountPercentage: discountPct, discountAmount: disc,
    finalUnitPrice: final, subtotal: final * qty,
  };
}

describe('TransactionsService', () => {
  beforeEach(() => { vi.clearAllMocks(); mockPrisma.product.update.mockResolvedValue({}); });

  describe('create — validation', () => {
    it('returns 400 for empty items array', async () => {
      const svc = new TransactionsService();
      await expect(svc.create('u1', [])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 for undefined items', async () => {
      const svc = new TransactionsService();
      await expect(svc.create('u1', undefined as any)).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 for null items', async () => {
      const svc = new TransactionsService();
      await expect(svc.create('u1', null as any)).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('create — stock & availability', () => {
    it('returns 400 if product not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'nonexistent', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 if product isInactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'F1 Shake', price: 100000, isActive: false, isAvailable: true }]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'p1', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 if product is unavailable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: false }]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'p1', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 if stock insufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 2 }]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'p1', quantity: 5 }])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('allows quantity equal to stock', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 3 };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'REGULAR', normalTotal: 300000, totalDiscount: 0, finalTotal: 300000, items: [priceItem(p, 3, 0)] }));
      const svc = new TransactionsService();
      expect(await svc.create('u1', [{ productId: 'p1', quantity: 3 }])).toMatchObject({ finalTotal: 300000 });
    });
  });

  describe('create — quantity validation', () => {
    it('returns 400 for quantity 0', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10 }]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'p1', quantity: 0 }])).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 for negative quantity', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10 }]);
      const svc = new TransactionsService();
      await expect(svc.create('u1', [{ productId: 'p1', quantity: -1 }])).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('create — server-side pricing & membership discount', () => {
    it('applies 30% discount for active MEMBER user', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'MEMBER', membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'MEMBER', normalTotal: 100000, totalDiscount: 30000, finalTotal: 70000, items: [priceItem(p, 1, 30)] }));
      const svc = new TransactionsService();
      const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);
      expect(tx.items[0].discountPercentage).toBe(30);
      expect(tx.items[0].discountAmount).toBe(30000);
      expect(tx.items[0].finalUnitPrice).toBe(70000);
    });
    it('does NOT apply discount for REGULAR user', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, items: [priceItem(p, 1, 0)] }));
      const svc = new TransactionsService();
      const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);
      expect(tx.items[0].discountPercentage).toBe(0);
      expect(tx.items[0].finalUnitPrice).toBe(100000);
    });
    it('does NOT apply discount when product is not member-discount eligible', async () => {
      const p = { id: 'p1', name: 'Special Bundle', price: 500000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: false };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'MEMBER', membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'MEMBER', normalTotal: 500000, totalDiscount: 0, finalTotal: 500000, items: [priceItem(p, 1, 0)] }));
      const svc = new TransactionsService();
      const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);
      expect(tx.items[0].discountPercentage).toBe(0);
      expect(tx.items[0].finalUnitPrice).toBe(500000);
    });
    it('does NOT apply discount for expired MEMBER', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'MEMBER', membershipExpiresAt: new Date(Date.now() - 86400000), isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, items: [priceItem(p, 1, 0)] }));
      const svc = new TransactionsService();
      const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);
      expect(tx.items[0].discountPercentage).toBe(0);
      expect(tx.membershipStatusSnapshot).toBe('regular');
    });
    it('calculates totals correctly for multiple items with discount', async () => {
      const p1 = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 100, isMemberDiscountEligible: true };
      const p2 = { id: 'p2', name: 'Amino', price: 50000, isActive: true, isAvailable: true, stock: 100, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'MEMBER', membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p1, p2]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'MEMBER', normalTotal: 250000, totalDiscount: 75000, finalTotal: 175000, items: [priceItem(p1, 2, 30), priceItem(p2, 1, 30)] }));
      const svc = new TransactionsService();
      const tx = await svc.create('u1', [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 1 }]);
      expect(tx.normalTotal).toBe(250000);
      expect(tx.totalDiscount).toBe(75000);
      expect(tx.finalTotal).toBe(175000);
    });
    it('snapshots membership status at transaction time', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'MEMBER', membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ membershipStatusSnapshot: 'MEMBER', items: [priceItem(p, 1, 30)] }));
      const svc = new TransactionsService();
      expect(await svc.create('u1', [{ productId: 'p1', quantity: 1 }])).toMatchObject({ membershipStatusSnapshot: 'member' });
    });
  });

  describe('create — stock deduction', () => {
    it('deducts stock from products after transaction', async () => {
      const p = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ items: [priceItem(p, 1, 0)] }));
      const svc = new TransactionsService();
      await svc.create('u1', [{ productId: 'p1', quantity: 3 }]);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stock: { decrement: 3 } } });
    });
    it('deducts stock from multiple products', async () => {
      const p1 = { id: 'p1', name: 'F1 Shake', price: 100000, isActive: true, isAvailable: true, stock: 10, isMemberDiscountEligible: true };
      const p2 = { id: 'p2', name: 'Amino', price: 50000, isActive: true, isAvailable: true, stock: 20, isMemberDiscountEligible: true };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
      mockPrisma.product.findMany.mockResolvedValue([p1, p2]);
      mockPrisma.transaction.create.mockResolvedValue(makeTxResult({ items: [priceItem(p1, 1, 0), priceItem(p2, 1, 0)] }));
      const svc = new TransactionsService();
      await svc.create('u1', [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 5 }]);
      expect(mockPrisma.product.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stock: { decrement: 2 } } });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { id: 'p2' }, data: { stock: { decrement: 5 } } });
    });
  });

  describe('listByUser', () => {
    it('returns paginated transactions for user', async () => {
      const now = new Date();
      mockPrisma.transaction.findMany.mockResolvedValue([{ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'COMPLETED', createdAt: now, updatedAt: now, items: [], payments: [] }]);
      mockPrisma.transaction.count.mockResolvedValue(1);
      const svc = new TransactionsService();
      const result = await svc.listByUser('u1', { page: 1, limit: 10 });
      expect(result.transactions).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
    it('defaults page and limit', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      const svc = new TransactionsService();
      await svc.listByUser('u1', {});
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
    });
    it('caps limit at 100', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      const svc = new TransactionsService();
      await svc.listByUser('u1', { limit: 500 });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
    });
  });

  describe('listAll', () => {
    it('returns all transactions with user info', async () => {
      const now = new Date();
      mockPrisma.transaction.findMany.mockResolvedValue([{ id: 'tx1', user: { id: 'u1', name: 'John', email: 'john@example.com' }, membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'COMPLETED', createdAt: now, updatedAt: now, items: [], payments: [] }]);
      mockPrisma.transaction.count.mockResolvedValue(1);
      const svc = new TransactionsService();
      const result = await svc.listAll({});
      expect(result.transactions[0]).toMatchObject({ id: 'tx1', user: { id: 'u1', name: 'John', email: 'john@example.com' } });
    });
    it('filters by status when provided', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      const svc = new TransactionsService();
      await svc.listAll({ status: 'pending' });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'PENDING' } }));
    });
  });

  describe('updateStatus', () => {
    it('updates transaction to valid next status', async () => {
      const now = new Date();
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'PENDING', createdAt: now, updatedAt: now, items: [], payments: [] });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'CANCELLED', createdAt: now, updatedAt: now, items: [], payments: [] });
      const svc = new TransactionsService();
      const tx = await svc.updateStatus('tx1', 'CANCELLED', 'admin1', 'admin');
      expect(tx.status).toBe('cancelled');
    });
    it('returns 400 for invalid status string', async () => {
      const svc = new TransactionsService();
      await expect(svc.updateStatus('tx1', 'INVALID', 'admin1', 'admin')).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 for invalid transition (PENDING -> COMPLETED)', async () => {
      const now = new Date();
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'PENDING', createdAt: now, updatedAt: now, items: [], payments: [] });
      const svc = new TransactionsService();
      await expect(svc.updateStatus('tx1', 'COMPLETED', 'admin1', 'admin')).rejects.toMatchObject({ statusCode: 400 });
    });
    it('returns 400 for invalid transition (COMPLETED -> PENDING)', async () => {
      const now = new Date();
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'COMPLETED', createdAt: now, updatedAt: now, items: [], payments: [] });
      const svc = new TransactionsService();
      await expect(svc.updateStatus('tx1', 'PENDING', 'admin1', 'admin')).rejects.toMatchObject({ statusCode: 400 });
    });
    it('restores stock when cancelling', async () => {
      const now = new Date();
      const items = [{ id: 'ti1', productId: 'p1', quantity: 3 }];
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 300000, totalDiscount: 0, finalTotal: 300000, status: 'PENDING', createdAt: now, updatedAt: now, items, payments: [] });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 300000, totalDiscount: 0, finalTotal: 300000, status: 'CANCELLED', createdAt: now, updatedAt: now, items, payments: [] });
      const svc = new TransactionsService();
      await svc.updateStatus('tx1', 'CANCELLED', 'admin1', 'admin');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stock: { increment: 3 } } });
    });
    it('does NOT restore stock when cancelling already-cancelled', async () => {
      const now = new Date();
      const items = [{ id: 'ti1', productId: 'p1', quantity: 3 }];
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 300000, totalDiscount: 0, finalTotal: 300000, status: 'CANCELLED', createdAt: now, updatedAt: now, items, payments: [] });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 300000, totalDiscount: 0, finalTotal: 300000, status: 'CANCELLED', createdAt: now, updatedAt: now, items, payments: [] });
      const svc = new TransactionsService();
      await svc.updateStatus('tx1', 'CANCELLED', 'admin1', 'admin');
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });
    it('allows valid transition chain: PROCESSING -> COMPLETED', async () => {
      const now = new Date();
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'PROCESSING', createdAt: now, updatedAt: now, items: [], payments: [] });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx1', membershipStatusSnapshot: 'REGULAR', normalTotal: 100000, totalDiscount: 0, finalTotal: 100000, status: 'COMPLETED', createdAt: now, updatedAt: now, items: [], payments: [] });
      const svc = new TransactionsService();
      const tx = await svc.updateStatus('tx1', 'COMPLETED', 'admin1', 'admin');
      expect(tx.status).toBe('completed');
    });
  });
});
