import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const m: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
  m.userRole = { count: vi.fn() };
  m.product = { count: vi.fn() };
  m.consultation = { count: vi.fn(), findMany: vi.fn() };
  m.transaction = { count: vi.fn(), findMany: vi.fn() };
  m.bmiRecord = { count: vi.fn(), findMany: vi.fn() };
  return { mockPrisma: m };
});

vi.mock('../../lib/db.js', () => ({ prisma: mockPrisma }));

vi.mock('../../config/env.js', () => ({
  env: {
    NODE_ENV: 'test', PORT: '3000', FRONTEND_URL: 'http://localhost:5173',
    DATABASE_URL: 'mysql://test:test@localhost:3306/test',
    JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars-long',
    JWT_EXPIRES_IN: '7d', PAYMENT_SIMULATION_ENABLED: 'false',
  },
}));

import { getDashboardStats } from './service.js';

describe('getDashboardStats', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns totalUsers from UserRole table (role.slug = user), not legacy role field', async () => {
    mockPrisma.userRole.count.mockResolvedValue(42);
    mockPrisma.product.count.mockResolvedValue(15);
    mockPrisma.consultation.count.mockResolvedValue(10);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(100);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(200);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    expect(mockPrisma.userRole.count).toHaveBeenCalledWith({ where: { role: { slug: 'user' } } });
    expect(stats.totalUsers).toBe(42);
  });

  it('does NOT use legacy role field for counting users', async () => {
    mockPrisma.userRole.count.mockResolvedValue(42);
    mockPrisma.product.count.mockResolvedValue(15);
    mockPrisma.consultation.count.mockResolvedValue(10);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(100);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(200);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    await getDashboardStats();
    expect(mockPrisma.userRole.count).toHaveBeenCalledWith({ where: { role: { slug: 'user' } } });
    expect(mockPrisma.userRole.count).not.toHaveBeenCalledWith({ where: { role: 'USER' } });
  });

  it('returns all counts correctly', async () => {
    mockPrisma.userRole.count.mockResolvedValue(42);
    mockPrisma.product.count.mockResolvedValue(15);
    mockPrisma.consultation.count.mockResolvedValue(10);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(100);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(200);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    expect(stats.totalUsers).toBe(42);
    expect(stats.totalProducts).toBe(15);
    expect(stats.totalConsultations).toBe(10);
    expect(stats.totalBmiRecords).toBe(200);
    expect(stats.totalTransactions).toBe(100);
  });

  it('returns pendingConsultations count', async () => {
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(5);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(0);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    expect(stats.pendingConsultations).toBe(5);
  });

  it('returns recentActivity sorted by time (most recent first)', async () => {
    const now = new Date();
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(2);
    mockPrisma.consultation.findMany.mockResolvedValue([
      { id: 'c1', status: 'PENDING', createdAt: new Date(now.getTime() - 10000), user: { id: 'u1', name: 'Alice' } },
      { id: 'c2', status: 'ANSWERED', createdAt: new Date(now.getTime() - 5000), user: { id: 'u2', name: 'Bob' } },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(1);
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 't1', finalTotal: 100000, createdAt: new Date(now.getTime() - 2000), user: { id: 'u3', name: 'Charlie' } },
    ]);
    mockPrisma.bmiRecord.count.mockResolvedValue(1);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([
      { id: 'b1', bmi: 22.5, createdAt: new Date(now.getTime() - 3000), user: { id: 'u4', name: 'Diana' } },
    ]);
    const stats = await getDashboardStats();
    expect(stats.recentActivity).toBeDefined();
    expect(stats.recentActivity.length).toBeGreaterThan(0);
    // Most recent: t1 (-2000ms) → b1 (-3000ms) → c2 (-5000ms) → c1 (-10000ms)
    expect(stats.recentActivity[0].id).toBe('t-t1');
  });

  it('includes consultation items in recentActivity', async () => {
    const now = new Date();
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(1);
    mockPrisma.consultation.findMany.mockResolvedValue([
      { id: 'c1', status: 'PENDING', createdAt: new Date(now.getTime() - 10000), user: { id: 'u1', name: 'Alice' } },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(0);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    const item = stats.recentActivity.find((a: any) => a.type === 'consultation')!;
    expect(item).toBeDefined();
    expect(item.text).toContain('Alice');
    expect(item.text).toContain('konsultasi baru');
  });

  it('limits recentActivity to 10 items', async () => {
    const now = new Date();
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      id: `c${i}`, status: 'PENDING', createdAt: new Date(now.getTime() - i * 1000),
      user: { id: `u${i}`, name: `User ${i}` },
    }));
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(15);
    mockPrisma.consultation.findMany.mockResolvedValue(manyItems);
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(0);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    expect(stats.recentActivity.length).toBeLessThanOrEqual(10);
  });

  it('handles null user gracefully in recentActivity', async () => {
    const now = new Date();
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(1);
    mockPrisma.consultation.findMany.mockResolvedValue([
      { id: 'c1', status: 'PENDING', createdAt: new Date(now.getTime() - 10000), user: null },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(0);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    const item = stats.recentActivity.find((a: any) => a.type === 'consultation')!;
    expect(item.text).toContain('Pengguna');
  });

  it('returns activity with formatted time strings', async () => {
    const now = new Date();
    mockPrisma.userRole.count.mockResolvedValue(0);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.consultation.count.mockResolvedValue(1);
    mockPrisma.consultation.findMany.mockResolvedValue([
      { id: 'c1', status: 'PENDING', createdAt: new Date(now.getTime() - 120000), user: { id: 'u1', name: 'Alice' } },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockResolvedValue(0);
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    const stats = await getDashboardStats();
    expect(stats.recentActivity[0].time).toMatch(/^\d+ menit lalu$/);
  });

  it('runs initial counts in parallel using Promise.all', async () => {
    const order: string[] = [];
    mockPrisma.userRole.count.mockImplementation(async () => { order.push('userRole'); return 0; });
    mockPrisma.product.count.mockImplementation(async () => { order.push('product'); return 0; });
    mockPrisma.consultation.count.mockImplementation(async () => { order.push('consultation'); return 0; });
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockImplementation(async () => { order.push('transaction'); return 0; });
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.bmiRecord.count.mockImplementation(async () => { order.push('bmiRecord'); return 0; });
    mockPrisma.bmiRecord.findMany.mockResolvedValue([]);
    await getDashboardStats();
    expect(order).toContain('userRole');
    expect(order).toContain('product');
    expect(order).toContain('consultation');
    expect(order).toContain('transaction');
    expect(order).toContain('bmiRecord');
  });
});
