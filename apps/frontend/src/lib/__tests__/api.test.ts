import { describe, it, expect, vi } from 'vitest';
import * as apiModule from '../api';

describe('API client', () => {
  describe('URL and method construction', () => {
    it('auth.register uses POST /api/auth/register', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, message: 'Registered', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.api.register({ name: 'Test', email: 'test@test.com', password: 'pass123' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('auth.login uses POST /api/auth/login', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.api.login({ email: 'test@test.com', password: 'pass123' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('auth.logout uses POST /api/auth/logout', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.api.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // GET calls do NOT set an explicit method — it's the browser default
    it('auth.me uses GET /api/auth/me (no explicit method — default)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.api.me();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', expect.any(Object));
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });

    it('products.list uses GET /api/products (no explicit method)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.productsApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/products', expect.any(Object));
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });

    it('products.getById uses GET /api/products/:id (no explicit method)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.productsApi.getById('prod-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/products/prod-123', expect.any(Object));
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });

    it('bmi.calculate uses POST /api/bmi/calculate', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.bmiApi.calculate({ weightKg: 70, heightCm: 175 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/bmi/calculate',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('consultationApi.list uses GET /api/consultations (no explicit method)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.consultationApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/consultations', expect.any(Object));
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });

    it('cartApi.get uses GET /api/cart (no explicit method)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.cartApi.get();

      expect(mockFetch).toHaveBeenCalledWith('/api/cart', expect.any(Object));
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });

    it('transactionApi.list uses GET /api/transactions with pagination (no explicit method)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true, message: 'OK',
          data: { transactions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await apiModule.transactionApi.list({ page: 2, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/transactions?page=2&limit=10', expect.any(Object)
      );
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts).not.toHaveProperty('method');
    });
  });

  describe('credentials: include', () => {
    it('all API calls include credentials: include for cookie auth', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: 'OK', data: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      // Test several different endpoints
      await apiModule.api.login({ email: 'test@test.com', password: 'pass' });
      await apiModule.userApi.getMe();
      await apiModule.productsApi.list();
      await apiModule.cartApi.get();

      for (const call of mockFetch.mock.calls) {
        expect(call[1]).toMatchObject({ credentials: 'include' });
      }
    });
  });

  describe('transactionApi.create item format', () => {
    it('passes items as { productId, quantity } array', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, message: 'Created', data: { id: 'tx-1' } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const items = [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ];
      await apiModule.transactionApi.create(items);

      const [, opts] = mockFetch.mock.calls[0];
      const body = JSON.parse(opts.body as string);
      expect(body).toEqual({ items });
      expect(body.items[0]).toHaveProperty('productId');
      expect(body.items[0]).toHaveProperty('quantity');
    });

    it('maps cart items correctly — productId and qty', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, message: 'Created', data: { id: 'tx-1' } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const cartItems = [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 1 },
        { productId: 'p3', quantity: 5 },
      ];
      await apiModule.transactionApi.create(cartItems);

      const [, opts] = mockFetch.mock.calls[0];
      const body = JSON.parse(opts.body as string);
      expect(body.items).toHaveLength(3);
      expect(body.items).toEqual(expect.arrayContaining([
        expect.objectContaining({ productId: 'p1', quantity: 3 }),
        expect.objectContaining({ productId: 'p2', quantity: 1 }),
        expect.objectContaining({ productId: 'p3', quantity: 5 }),
      ]));
    });
  });

  describe('register response handling', () => {
    it('register handles response with message but no user data (success = true)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        // Backend returns message only, no data field for register
        json: () => Promise.resolve({ success: true, message: 'Registrasi berhasil. Silakan login.' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await apiModule.api.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
      });

      // Should not throw — register doesn't require user data in response
      expect(result.success).toBe(true);
      expect(result.message).toBe('Registrasi berhasil. Silakan login.');
      expect(result.data).toBeUndefined();
    });

    it('register handles 409 conflict (email exists) gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ success: false, message: 'Email sudah terdaftar.' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        apiModule.api.register({ name: 'Dup', email: 'existing@test.com', password: 'pass' })
      ).rejects.toThrow('Email sudah terdaftar.');
    });
  });
});
