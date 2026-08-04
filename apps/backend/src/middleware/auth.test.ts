import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock jsonwebtoken and env ──
vi.mock('jsonwebtoken', () => ({ default: { verify: vi.fn() } }));

vi.mock('../config/env.js', () => ({
  env: {
    NODE_ENV: 'test', PORT: '3000', FRONTEND_URL: 'http://localhost:5173',
    DATABASE_URL: 'mysql://test:test@localhost:3306/test',
    JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars-long', JWT_EXPIRES_IN: '7d',
    PAYMENT_SIMULATION_ENABLED: 'false',
  },
}));

vi.mock('../modules/pricing/index.js', () => ({
  getMemberDiscountRate: vi.fn().mockResolvedValue(0.30),
  getMembershipPlans: vi.fn().mockResolvedValue([]),
  getDefaultMembershipPlan: vi.fn().mockResolvedValue(null),
  clearDiscountCache: vi.fn(),
}));

// ── Mock rbac/service.js with a shared closure variable ──
// The factory creates the mock. Tests configure via the closure variable.
let _mockPerms: string[] | null = null;
let _mockError: Error | null = null;

vi.mock('../modules/rbac/service.js', () => ({
  getUserPermissions: vi.fn(async (_userId: string) => {
    if (_mockError) throw _mockError;
    return _mockPerms ?? [];
  }),
}));

// ── Import AFTER mocks ───────────────────────────────────────────────────────
import { authMiddleware, requireUser, requireAdmin, requirePermission } from './auth.js';
import { getUserPermissions } from '../modules/rbac/service.js';
import jwt from 'jsonwebtoken';

// ── Test helpers ─────────────────────────────────────────────────────────────
const mockRes = () => ({ json: vi.fn(), status: vi.fn().mockReturnThis() });
const mockNext = () => vi.fn();

const setPerms = (perms: string[] | null) => { _mockPerms = perms; _mockError = null; };
const setError = (err: Error | null) => { _mockError = err; _mockPerms = null; };
const clearMock = () => { _mockPerms = null; _mockError = null; };

// ─────────────────────────────────────────────────────────────────────────────
// authMiddleware
// ─────────────────────────────────────────────────────────────────────────────
describe('authMiddleware', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sets req.user and calls next() when token is valid', () => {
    const payload = { userId: 'user-1', role: 'user' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue(payload);
    const req = { cookies: { accessToken: 'valid-token' } } as any;
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
  });

  it('returns 401 when no token cookie is present', () => {
    const req = { cookies: {} } as any;
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed', () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementationOnce(() => { throw new Error('malformed'); });
    const req = { cookies: { accessToken: 'bad-token' } } as any;
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or expired token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    const err = new Error('jwt expired'); err.name = 'TokenExpiredError';
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementationOnce(() => { throw err; });
    const req = { cookies: { accessToken: 'expired-token' } } as any;
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or expired token.' });
    expect(next).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requireUser
// ─────────────────────────────────────────────────────────────────────────────
describe('requireUser', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls next() when role is "user"', () => {
    const req = { user: { userId: 'u1', role: 'user' } } as any;
    const next = mockNext();
    requireUser(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when role is "admin"', () => {
    const req = { user: { userId: 'a1', role: 'admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    requireUser(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Akses hanya untuk pengguna.' });
  });

  it('returns 403 when role is "super_admin"', () => {
    const req = { user: { userId: 'sa1', role: 'super_admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    requireUser(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when req.user is undefined', () => {
    const req = { user: undefined } as any;
    const res = mockRes();
    const next = mockNext();
    requireUser(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requireAdmin
// ─────────────────────────────────────────────────────────────────────────────
describe('requireAdmin', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls next() when role is "admin"', () => {
    const req = { user: { userId: 'a1', role: 'admin' } } as any;
    const next = mockNext();
    requireAdmin(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when role is "super_admin"', () => {
    const req = { user: { userId: 'sa1', role: 'super_admin' } } as any;
    const next = mockNext();
    requireAdmin(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when role is "user" (USER accessing admin API)', () => {
    const req = { user: { userId: 'u1', role: 'user' } } as any;
    const res = mockRes();
    const next = mockNext();
    requireAdmin(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden.' });
  });

  it('returns 403 when req.user is undefined', () => {
    const req = { user: undefined } as any;
    const res = mockRes();
    const next = mockNext();
    requireAdmin(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission(perm)
// Uses a closure variable shared between the vi.mock factory and test code
// to configure getUserPermissions behavior without factory isolation issues.
// ─────────────────────────────────────────────────────────────────────────────
describe('requirePermission middleware', () => {
  beforeEach(() => { vi.clearAllMocks(); clearMock(); });

  it('returns 401 when req.user is undefined', async () => {
    const req = { user: undefined } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('products:read')(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('super_admin bypasses permission check — next() without calling getUserPermissions', async () => {
    setPerms(['products:read']); // should NOT be used
    const req = { user: { userId: 'sa1', role: 'super_admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('roles:delete')(req, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(vi.mocked(getUserPermissions)).not.toHaveBeenCalled();
  });

  it('calls next() when admin has the required permission', async () => {
    setPerms(['products:read', 'products:create', 'users:read']);

    const req = { user: { userId: 'a1', role: 'admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('products:read')(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(vi.mocked(getUserPermissions)).toHaveBeenCalledWith('a1');
    expect(req.user?.permissions).toEqual(['products:read', 'products:create', 'users:read']);
  });

  it('returns 403 when admin does NOT have the required permission', async () => {
    setPerms(['products:read', 'users:read']);

    const req = { user: { userId: 'a1', role: 'admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('roles:delete')(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Permission "roles:delete" diperlukan.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 500 when getUserPermissions throws (database error)', async () => {
    setError(new Error('DB connection failed'));

    const req = { user: { userId: 'a1', role: 'admin' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('products:read')(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Gagal memverifikasi permission.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when user role has the required permission via RBAC', async () => {
    setPerms(['consultations:read', 'bmi:read']);

    const req = { user: { userId: 'u1', role: 'user' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('consultations:read')(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(vi.mocked(getUserPermissions)).toHaveBeenCalledWith('u1');
  });

  it('returns 403 when user role does NOT have the required permission', async () => {
    setPerms(['bmi:read']);

    const req = { user: { userId: 'u1', role: 'user' } } as any;
    const res = mockRes();
    const next = mockNext();
    await requirePermission('products:create')(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
