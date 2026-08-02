import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const m: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
  m.role = { findUnique: vi.fn() };
  m.user = { findUnique: vi.fn() };
  m.userRole = { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() };
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

vi.mock('../../modules/pricing/index.js', () => ({
  clearDiscountCache: vi.fn(),
}));

import { setUserRoles } from './controller.js';

describe('RBAC Controller — setUserRoles', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // ── Role checks ────────────────────────────────────────────────────────────

  it('returns 403 when actor is regular user', async () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'u1', role: 'user' }, params: { userId: 'target1' }, body: { roleIds: ['role-admin'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Tidak memiliki hak untuk mengubah role user.',
    }));
  });

  it('returns 400 for invalid roleIds format', async () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'super1', role: 'super_admin' }, params: { userId: 'target1' }, body: { roleIds: 'not-an-array' } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
  });

  it('admin can assign non-super_admin roles to self', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-user', name: 'User', slug: 'user' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'admin1' });
    mockPrisma.userRole.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.userRole.createMany.mockResolvedValue({ count: 1 });

    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'admin1', role: 'admin' }, params: { userId: 'admin1' }, body: { roleIds: ['role-user'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('admin CANNOT self-assign super_admin role', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-superadmin', name: 'Super Admin', slug: 'super_admin', isSystem: true });

    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'admin1', role: 'admin' }, params: { userId: 'admin1' }, body: { roleIds: ['role-superadmin'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Hanya Super Admin yang dapat memberikan role Super Admin.',
    }));
  });

  it('admin CANNOT assign roles to other users', async () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'admin1', role: 'admin' }, params: { userId: 'other1' }, body: { roleIds: ['role-user'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Tidak dapat mengubah role user lain.',
    }));
  });

  it('super_admin CAN assign super_admin role to another user', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-superadmin', name: 'Super Admin', slug: 'super_admin', isSystem: true });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'target1' });
    mockPrisma.userRole.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.userRole.createMany.mockResolvedValue({ count: 1 });

    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'super1', role: 'super_admin' }, params: { userId: 'target1' }, body: { roleIds: ['role-superadmin'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('super_admin CANNOT self-assign super_admin role', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-superadmin', name: 'Super Admin', slug: 'super_admin', isSystem: true });

    const json = vi.fn();
    const status = vi.fn().mockReturnThis();
    const res = { json, status } as any;
    const req = { user: { userId: 'super1', role: 'super_admin' }, params: { userId: 'super1' }, body: { roleIds: ['role-superadmin'] } } as any;
    const next = vi.fn() as any;

    await setUserRoles(req, res, next);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Tidak dapat mengubah role diri sendiri.',
    }));
  });
});
