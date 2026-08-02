import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../modules/pricing/index.js', () => ({
  getMemberDiscountRate: vi.fn().mockResolvedValue(0.30),
  clearDiscountCache: vi.fn(),
}));

interface MockPrisma {
  user: Record<string, ReturnType<typeof vi.fn>>;
  product: Record<string, ReturnType<typeof vi.fn>>;
  transaction: Record<string, ReturnType<typeof vi.fn>>;
  payment: Record<string, ReturnType<typeof vi.fn>>;
  chatConversation: Record<string, ReturnType<typeof vi.fn>>;
  $transaction: ReturnType<typeof vi.fn>;
}

// vi.hoisted runs at module load time — refs are shared between mock factory and test code
const { user, product, transaction, payment, chatConversation, $transaction } = vi.hoisted(() => {
  const u = { findUnique: vi.fn() };
  const p = { findMany: vi.fn(), update: vi.fn() };
  const t = { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() };
  const pay = { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn() };
  const conv = { findUnique: vi.fn() };
  const $tx = vi.fn().mockImplementation(async (fn) => fn({ user: u, product: p, transaction: t }));
  return { user: u, product: p, transaction: t, payment: pay, chatConversation: conv, $transaction: $tx };
});

vi.mock('../lib/db.js', () => ({
  // Return prismaRef directly so all accesses share the same object
  get prisma() { return { user, product, transaction, payment, chatConversation, $transaction }; },
}));

let _prisma: MockPrisma;
const getPrisma = async (): Promise<MockPrisma> => {
  if (!_prisma) _prisma = (await import('../lib/db.js')).prisma as unknown as MockPrisma;
  return _prisma;
};

// ────────────────────────────────────────────────────────────────
// Auth Tests
// ────────────────────────────────────────────────────────────────
describe('Auth', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('login rejects wrong password', async () => {
    const { AuthService } = await import('../modules/auth/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({
      id: 'u1', email: 'test@test.com', passwordHash: 'hash', isActive: true, role: 'USER',
    });
    const svc = new AuthService();
    await expect(svc.login({ email: 'test@test.com', password: 'wrong' })).rejects.toMatchObject({ statusCode: 401 });
  });

  it('login rejects inactive user', async () => {
    const { AuthService } = await import('../modules/auth/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({
      id: 'u1', email: 'test@test.com', passwordHash: 'hash', isActive: false, role: 'USER',
    });
    const svc = new AuthService();
    await expect(svc.login({ email: 'test@test.com', password: 'pass' })).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ────────────────────────────────────────────────────────────────
// Transactions - Pricing
// ────────────────────────────────────────────────────────────────
describe('Transactions - Pricing', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('active MEMBER gets 30% discount', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({
      id: 'u1', membershipStatus: 'MEMBER',
      membershipExpiresAt: new Date(Date.now() + 86400000), isActive: true,
    });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: true, isAvailable: true },
    ]);
    prisma.transaction.create = vi.fn().mockResolvedValue({
      id: 'tx1', userId: 'u1', membershipStatusSnapshot: 'MEMBER', normalTotal: BigInt(100000), totalDiscount: BigInt(30000), finalTotal: BigInt(70000),
      status: 'PENDING', createdAt: new Date(), updatedAt: new Date(),
      items: [{
        id: 'i1', productId: 'p1', productName: 'F1 Shake', quantity: 1,
        basePrice: BigInt(100000), discountPercentage: BigInt(30), discountAmount: BigInt(30000),
        finalUnitPrice: BigInt(70000), subtotal: BigInt(70000),
      }],
    });

    const svc = new TransactionsService();
    const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);

    expect(tx.items[0].discountPercentage).toBe(30);
    expect(tx.items[0].basePrice).toBe(100000);
    expect(tx.items[0].discountAmount).toBe(30000);
    expect(tx.items[0].finalUnitPrice).toBe(70000);
    expect(tx.membershipStatusSnapshot).toBe('member');
  });

  it('expired MEMBER pays normal price', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({
      id: 'u1', membershipStatus: 'MEMBER',
      membershipExpiresAt: new Date(Date.now() - 86400000), isActive: true,
    });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: true, isAvailable: true },
    ]);
    prisma.transaction.create = vi.fn().mockResolvedValue({
      id: 'tx1', userId: 'u1', membershipStatusSnapshot: 'REGULAR', normalTotal: BigInt(100000), totalDiscount: BigInt(0), finalTotal: BigInt(100000),
      status: 'PENDING', createdAt: new Date(), updatedAt: new Date(),
      items: [{
        id: 'i1', productId: 'p1', productName: 'F1 Shake', quantity: 1,
        basePrice: BigInt(100000), discountPercentage: BigInt(0), discountAmount: BigInt(0),
        finalUnitPrice: BigInt(100000), subtotal: BigInt(100000),
      }],
    });

    const svc = new TransactionsService();
    const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);

    expect(tx.items[0].discountPercentage).toBe(0);
    expect(tx.items[0].finalUnitPrice).toBe(100000);
    expect(tx.membershipStatusSnapshot).toBe('regular');
  });

  it('REGULAR user pays normal price', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: true, isAvailable: true },
    ]);
    prisma.transaction.create = vi.fn().mockResolvedValue({
      id: 'tx1', userId: 'u1', membershipStatusSnapshot: 'REGULAR', normalTotal: BigInt(100000), totalDiscount: BigInt(0), finalTotal: BigInt(100000),
      status: 'PENDING', createdAt: new Date(), updatedAt: new Date(),
      items: [{
        id: 'i1', productId: 'p1', productName: 'F1 Shake', quantity: 1,
        basePrice: BigInt(100000), discountPercentage: BigInt(0), discountAmount: BigInt(0),
        finalUnitPrice: BigInt(100000), subtotal: BigInt(100000),
      }],
    });

    const svc = new TransactionsService();
    const tx = await svc.create('u1', [{ productId: 'p1', quantity: 1 }]);

    expect(tx.items[0].discountPercentage).toBe(0);
    expect(tx.items[0].finalUnitPrice).toBe(100000);
  });

  it('rejects empty cart', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const svc = new TransactionsService();
    await expect(svc.create('u1', [])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects quantity 0', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: true, isAvailable: true },
    ]);
    const svc = new TransactionsService();
    await expect(svc.create('u1', [{ productId: 'p1', quantity: 0 }])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects invalid product', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
    prisma.product.findMany = vi.fn().mockResolvedValue([]);
    const svc = new TransactionsService();
    await expect(svc.create('u1', [{ productId: 'nonexistent', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects inactive product', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: false, isAvailable: true },
    ]);
    const svc = new TransactionsService();
    await expect(svc.create('u1', [{ productId: 'p1', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects unavailable product', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const prisma = await getPrisma();
    prisma.user.findUnique = vi.fn().mockResolvedValue({ id: 'u1', membershipStatus: 'REGULAR', isActive: true });
    prisma.product.findMany = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'F1 Shake', price: BigInt(100000), isMemberDiscountEligible: true, isActive: true, isAvailable: false },
    ]);
    const svc = new TransactionsService();
    await expect(svc.create('u1', [{ productId: 'p1', quantity: 1 }])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects invalid status update', async () => {
    const { TransactionsService } = await import('../modules/transactions/service.js');
    const svc = new TransactionsService();
    await expect(svc.updateStatus('tx1', 'INVALID_STATUS', 'admin1', 'admin')).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ────────────────────────────────────────────────────────────────
// Payments
// ────────────────────────────────────────────────────────────────
describe('Payments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('rejects payment for another users transaction', async () => {
    const { PaymentsService } = await import('../modules/payments/service.js');
    const prisma = await getPrisma();
    prisma.transaction.findUnique = vi.fn().mockResolvedValue({ id: 'tx1', userId: 'u1', status: 'PENDING', finalTotal: BigInt(100000) });
    const svc = new PaymentsService();
    await expect(svc.create('u2', 'tx1', 'bca')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects second pending payment for same transaction', async () => {
    const { PaymentsService } = await import('../modules/payments/service.js');
    const prisma = await getPrisma();
    prisma.transaction.findUnique = vi.fn().mockResolvedValue({ id: 'tx1', userId: 'u1', status: 'AWAITING_PAYMENT', finalTotal: BigInt(100000) });
    prisma.payment.findFirst = vi.fn().mockResolvedValue({ id: 'pay1', status: 'PENDING' });
    const svc = new PaymentsService();
    await expect(svc.create('u1', 'tx1', 'bca')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('uses transaction finalTotal not frontend amount', async () => {
    const { PaymentsService } = await import('../modules/payments/service.js');
    const prisma = await getPrisma();
    prisma.transaction.findUnique = vi.fn().mockResolvedValue({ id: 'tx1', userId: 'u1', status: 'PENDING', finalTotal: BigInt(150000) });
    prisma.payment.findFirst = vi.fn().mockResolvedValue(null);
    prisma.payment.create = vi.fn().mockResolvedValue({
      id: 'pay1', transactionId: 'tx1', userId: 'u1', method: 'bca', provider: 'BCA Virtual Account',
      amount: BigInt(150000), referenceNumber: 'SIMTEST1234', paymentCode: 'VA-123', qrPayload: null,
      status: 'PENDING', paidAt: null, expiresAt: new Date(), createdAt: new Date(),
    });
    prisma.transaction.update = vi.fn().mockResolvedValue({ id: 'tx1' });
    const svc = new PaymentsService();
    const pay = await svc.create('u1', 'tx1', 'bca');
    expect(pay.amount).toBe(150000);
  });

  it('reference number contains SIM prefix', async () => {
    const { PaymentsService } = await import('../modules/payments/service.js');
    const prisma = await getPrisma();
    prisma.transaction.findUnique = vi.fn().mockResolvedValue({ id: 'tx1', userId: 'u1', status: 'PENDING', finalTotal: BigInt(100000) });
    prisma.payment.findFirst = vi.fn().mockResolvedValue(null);
    prisma.payment.create = vi.fn().mockResolvedValue({
      id: 'pay1', transactionId: 'tx1', userId: 'u1', method: 'qris', provider: 'QRIS',
      amount: BigInt(100000), referenceNumber: 'SIMTEST1234', paymentCode: null, qrPayload: 'PAYLOAD',
      status: 'PENDING', paidAt: null, expiresAt: new Date(), createdAt: new Date(),
    });
    prisma.transaction.update = vi.fn().mockResolvedValue({ id: 'tx1' });
    const svc = new PaymentsService();
    const pay = await svc.create('u1', 'tx1', 'qris');
    expect(pay.referenceNumber.startsWith('SIM')).toBe(true);
  });

  it('rejects simulation when disabled', async () => {
    const { PaymentsService } = await import('../modules/payments/service.js');
    const prisma = await getPrisma();
    prisma.payment.findUnique = vi.fn().mockResolvedValue({ id: 'pay1', userId: 'u1', status: 'PENDING', transactionId: 'tx1' });
    const svc = new PaymentsService();
    await expect(svc.simulate('u1', 'pay1', 'success')).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ────────────────────────────────────────────────────────────────
// Chat
// ────────────────────────────────────────────────────────────────
describe('Chat', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('user cannot read another users conversation', async () => {
    const { ChatService } = await import('../modules/chat/service.js');
    const prisma = await getPrisma();
    prisma.chatConversation.findUnique = vi.fn().mockResolvedValue({ id: 'conv1', userId: 'u1' });
    const svc = new ChatService();
    await expect(svc.getMessages('conv1', 'u2', false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('user cannot mark read another users conversation', async () => {
    const { ChatService } = await import('../modules/chat/service.js');
    const prisma = await getPrisma();
    prisma.chatConversation.findUnique = vi.fn().mockResolvedValue({ id: 'conv1', userId: 'u1' });
    const svc = new ChatService();
    await expect(svc.markRead('conv1', 'u2', false)).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ────────────────────────────────────────────────────────────────
// BMI
// ────────────────────────────────────────────────────────────────
describe('BMI', () => {
  it('calculates correct categories', async () => {
    const { BmiService } = await import('../modules/bmi/service.js');
    const svc = new BmiService();
    expect(svc.calculate(60, 170).category).toBe('Normal');
    expect(svc.calculate(50, 170).category).toBe('Kurus');
    expect(svc.calculate(80, 170).category).toBe('Kelebihan Berat');
    expect(svc.calculate(100, 170).category).toBe('Obesitas');
  });
});
