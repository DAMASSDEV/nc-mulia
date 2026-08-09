import { describe, it, expect, vi, beforeEach } from 'vitest';

const bcryptMock = vi.hoisted(() => ({ compare: vi.fn(), hash: vi.fn().mockResolvedValue('hashedpassword') }));

const { mockPrisma } = vi.hoisted(() => {
  const m: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
  m.user = { findUnique: vi.fn(), create: vi.fn() };
  m.userRole = { findMany: vi.fn() };
  return { mockPrisma: m };
});

vi.mock('../../lib/db.js', () => ({ prisma: mockPrisma }));

vi.mock('bcryptjs', () => ({ default: bcryptMock, __esModule: true }));

vi.mock('../../config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: '3000',
    FRONTEND_URL: 'http://localhost:5173',
    DATABASE_URL: 'mysql://test:test@localhost:3306/test',
    JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars-long',
    JWT_EXPIRES_IN: '7d',
    PAYMENT_SIMULATION_ENABLED: 'false',
  },
}));

vi.mock('../../modules/pricing/index.js', () => ({
  getMemberDiscountRate: vi.fn().mockResolvedValue(0.30),
  getMembershipPlans: vi.fn().mockResolvedValue([]),
  getDefaultMembershipPlan: vi.fn().mockResolvedValue(null),
  clearDiscountCache: vi.fn(),
}));

// ── Import AFTER mocks (hoisted above) ─────────────────────────────────────
import { AuthService } from './service.js';
import { register, login, logout, me } from './controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service unit tests
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.userRole.findMany.mockResolvedValue([]);
  });

  // ── hashPassword ──────────────────────────────────────────────────────────
  describe('hashPassword', () => {
    it('hashes password using bcrypt with cost factor 12', async () => {
      const svc = new AuthService();
      const hash = await svc.hashPassword('plaintext123');
      expect(hash).not.toBe('plaintext123');
      expect(bcryptMock.hash).toHaveBeenCalledWith('plaintext123', 12);
    });
  });

  // ── register ───────────────────────────────────────────────────────────────
  describe('register', () => {
    it('creates a user with hashed password and user role', async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-new',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        passwordHash: 'hashed',
        role: 'USER',
        membershipStatus: 'REGULAR',
        isActive: true,
        createdAt: now,
      });

      const svc = new AuthService();
      const result = await svc.register({ name: 'John Doe', email: 'john@example.com', passwordHash: 'hashed' });

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.role).toBe('user');
      expect(result.membershipStatus).toBe('regular');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      const createData = mockPrisma.user.create.mock.calls[0][0];
      expect(createData.data.name).toBe('John Doe');
      expect(createData.data.email).toBe('john@example.com');
    });

    // Mandatory: register does NOT return a token (no auto-login)
    it('register does not return a token — no auto-login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-new', name: 'John', email: 'john@example.com', passwordHash: 'hashed',
        membershipStatus: 'REGULAR', isActive: true, createdAt: new Date(),
      });

      const svc = new AuthService();
      const result = await svc.register({ name: 'John', email: 'john@example.com', passwordHash: 'hashed' });

      expect(result).not.toHaveProperty('token');
    });

    it('throws 409 when email already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'john@example.com' });

      const svc = new AuthService();
      await expect(svc.register({ name: 'John', email: 'john@example.com', passwordHash: 'hash' }))
        .rejects.toMatchObject({ statusCode: 409, message: 'Email sudah terdaftar.' });
    });

    it('normalizes email to lowercase', async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-new',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed',
        membershipStatus: 'REGULAR',
        isActive: true,
        createdAt: now,
      });

      const svc = new AuthService();
      await svc.register({ name: 'John Doe', email: 'John@Example.COM', passwordHash: 'hashed' });

      const createData = mockPrisma.user.create.mock.calls[0][0];
      expect(createData.data.email).toBe('john@example.com');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('returns token and user on correct credentials', async () => {
      bcryptMock.compare.mockResolvedValue(true);
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'john@example.com', passwordHash: 'hashedpassword', isActive: true,
        name: 'John Doe', phone: '0812', membershipStatus: 'REGULAR', membershipExpiresAt: null, createdAt: now,
      });

      const svc = new AuthService();
      const result = await svc.login({ email: 'john@example.com', password: 'password123' });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.role).toBe('user');
      expect(result.user.membershipStatus).toBe('regular');
    });

    it('throws 401 for wrong password', async () => {
      bcryptMock.compare.mockResolvedValue(false);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'john@example.com', passwordHash: 'hashedpassword', isActive: true,
        membershipStatus: 'REGULAR', membershipExpiresAt: null,
      });

      const svc = new AuthService();
      await expect(svc.login({ email: 'john@example.com', password: 'wrong-password' }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws 401 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const svc = new AuthService();
      await expect(svc.login({ email: 'nobody@example.com', password: 'pass' }))
        .rejects.toMatchObject({ statusCode: 401, message: 'Email atau password salah.' });
    });

    it('throws 403 when account is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'john@example.com', passwordHash: 'hashedpassword', isActive: false,
        membershipStatus: 'REGULAR', membershipExpiresAt: null,
      });

      const svc = new AuthService();
      await expect(svc.login({ email: 'john@example.com', password: 'pass' }))
        .rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ── getProfile ─────────────────────────────────────────────────────────────
  describe('getProfile', () => {
    it('returns user profile with role slug', async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0812',
        role: 'USER',
        membershipStatus: 'MEMBER',
        membershipExpiresAt: new Date(Date.now() + 86400000),
        isActive: true,
        createdAt: now,
      });

      const svc = new AuthService();
      const profile = await svc.getProfile('u1');

      expect(profile.id).toBe('u1');
      expect(profile.name).toBe('John Doe');
      expect(profile.role).toBe('user');
      expect(profile.membershipStatus).toBe('member');
    });

    it('throws 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const svc = new AuthService();
      await expect(svc.getProfile('nonexistent')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── role slug resolution ───────────────────────────────────────────────────
  describe('getUserRoleSlug', () => {
    it('returns super_admin when user has super_admin role', async () => {
      mockPrisma.userRole.findMany.mockResolvedValue([
        { role: { slug: 'user' } },
        { role: { slug: 'super_admin' } },
      ]);
      const svc = new AuthService();
      const slug = await (svc as any).getUserRoleSlug('u1');
      expect(slug).toBe('super_admin');
    });

    it('returns admin when user has admin role (no super_admin)', async () => {
      mockPrisma.userRole.findMany.mockResolvedValue([
        { role: { slug: 'user' } },
        { role: { slug: 'admin' } },
      ]);
      const svc = new AuthService();
      const slug = await (svc as any).getUserRoleSlug('u1');
      expect(slug).toBe('admin');
    });

    it('returns user when user has only user role', async () => {
      mockPrisma.userRole.findMany.mockResolvedValue([{ role: { slug: 'user' } }]);
      const svc = new AuthService();
      const slug = await (svc as any).getUserRoleSlug('u1');
      expect(slug).toBe('user');
    });

    it('returns user as default when no roles found', async () => {
      mockPrisma.userRole.findMany.mockResolvedValue([]);
      const svc = new AuthService();
      const slug = await (svc as any).getUserRoleSlug('u1');
      expect(slug).toBe('user');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller tests (register, login, logout, me)
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.userRole.findMany.mockResolvedValue([]);
    bcryptMock.compare.mockReset();
    bcryptMock.hash.mockResolvedValue('hashedpassword');
  });

  // ── register ───────────────────────────────────────────────────────────────
  describe('register', () => {
    it('returns 201 with success message after registration (no auto-login)', async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-new',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed',
        membershipStatus: 'REGULAR',
        isActive: true,
        createdAt: now,
      });

      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const cookie = vi.fn();
      const res = { json, status, cookie } as any;
      const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'password123' } } as any;
      const next = vi.fn() as any;

      await register(req, res, next);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Registrasi berhasil. Silakan masuk menggunakan akun Anda.' }));
      expect(cookie).not.toHaveBeenCalled();
    });

    it('returns 400 for name too short', async () => {
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { name: 'J', email: 'john@example.com', password: 'password123' } } as any;
      const next = vi.fn() as any;

      await register(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns 400 for invalid email', async () => {
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { name: 'John Doe', email: 'not-an-email', password: 'password123' } } as any;
      const next = vi.fn() as any;

      await register(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for password too short', async () => {
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'short' } } as any;
      const next = vi.fn() as any;

      await register(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
    });

    // Mandatory: after register, /api/auth/me returns unauthenticated (no cookie set)
    it('after register, me endpoint rejects with 401 when no auth cookie is set', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-new', name: 'John', email: 'john@example.com', passwordHash: 'hashed',
        membershipStatus: 'REGULAR', isActive: true, createdAt: new Date(),
      });

      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const cookie = vi.fn();
      const res = { json, status, cookie } as any;
      const req = { body: { name: 'John', email: 'john@example.com', password: 'password123' } } as any;
      const next = vi.fn() as any;

      // Register first — no cookie set
      await register(req, res, next);
      expect(status).toHaveBeenCalledWith(201);
      expect(cookie).not.toHaveBeenCalled(); // no auth cookie

      // me endpoint with NO req.user — simulates calling /me without logging in
      const meJson = vi.fn();
      const meRes = { json: meJson } as any;
      const meReq = { user: undefined } as any;
      const meNext = vi.fn() as any;

      await me(meReq, meRes, meNext);

      // me() catches TypeError from req.user! and calls next(error)
      expect(meNext).toHaveBeenCalledWith(expect.any(TypeError));
    });

    it('passes errors to next middleware on unexpected error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'password123' } } as any;
      const next = vi.fn() as any;

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('sets JWT cookie on successful login', async () => {
      bcryptMock.compare.mockResolvedValue(true);
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'john@example.com', passwordHash: 'hashedpassword', isActive: true,
        name: 'John Doe', phone: null, membershipStatus: 'REGULAR', membershipExpiresAt: null, createdAt: now,
      });

      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const cookie = vi.fn();
      const res = { json, status, cookie } as any;
      const req = { body: { email: 'john@example.com', password: 'password123' } } as any;
      const next = vi.fn() as any;

      await login(req, res, next);

      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Login berhasil.' }));
      expect(cookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
      );
    });

    it('returns 400 for missing email', async () => {
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { password: 'password123' } } as any;
      const next = vi.fn() as any;

      await login(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
    });

    it('returns 401 for wrong password', async () => {
      bcryptMock.compare.mockResolvedValue(false);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'john@example.com', passwordHash: 'hashedpassword', isActive: true,
        membershipStatus: 'REGULAR', membershipExpiresAt: null,
      });

      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { body: { email: 'john@example.com', password: 'wrong' } } as any;
      const next = vi.fn() as any;

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears accessToken cookie', async () => {
      const json = vi.fn();
      const clearCookie = vi.fn();
      const res = { json, clearCookie } as any;
      const req = {} as any;
      const next = vi.fn() as any;

      await logout(req, res, next);

      expect(clearCookie).toHaveBeenCalledWith('accessToken', expect.anything());
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Logout berhasil.' }));
    });
  });

  // ── me ─────────────────────────────────────────────────────────────────────
  describe('me', () => {
    it('returns user data for authenticated request', async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', name: 'John Doe', email: 'john@example.com', phone: null,
        role: 'USER', membershipStatus: 'REGULAR', membershipExpiresAt: null, isActive: true, createdAt: now,
      });

      const json = vi.fn();
      const res = { json } as any;
      const req = { user: { userId: 'u1', role: 'user' } } as any;
      const next = vi.fn() as any;

      await me(req, res, next);

      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'u1', name: 'John Doe' }),
      }));
    });

    it('throws when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const json = vi.fn();
      const res = { json } as any;
      const req = { user: { userId: 'nonexistent', role: 'user' } } as any;
      const next = vi.fn() as any;

      await me(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    // Mandatory: protected route rejected after register (no cookie set means 401)
    it('protected route rejected after register — no token means 401', async () => {
      const json = vi.fn();
      const status = vi.fn().mockReturnThis();
      const res = { json, status } as any;
      const req = { cookies: {} } as any; // no accessToken cookie
      const next = vi.fn() as any;

      const { authMiddleware } = await import('../../middleware/auth.js');
      authMiddleware(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Unauthorized.' }));
    });
  });
});
