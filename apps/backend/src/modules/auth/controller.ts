import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './service.js';
import { parseErrors } from '../../middleware/error.js';
import { env } from '../../config/env.js';
import { createAuditLog } from '../audit/service.js';
import { getClientIp, getUserAgent } from '../../lib/audit.js';

const authService = new AuthService();

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password diperlukan'),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    await authService.register({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, passwordHash: await authService.hashPassword(parsed.data.password) });
    res.status(201).json({ success: true, message: 'Registrasi berhasil. Silakan masuk menggunakan akun Anda.' });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const result = await authService.login(parsed.data);
    const isProd = env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    if (result.user?.id) {
      createAuditLog({
        actorUserId: result.user.id,
        action: 'login',
        module: 'auth',
        entityType: 'user',
        entityId: result.user.id,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Login berhasil.', data: result.user });
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, _next: NextFunction) {
  const isProd = env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (req.user?.userId) {
    createAuditLog({
      actorUserId: req.user.userId,
      action: 'logout',
      module: 'auth',
      entityType: 'user',
      entityId: req.user.userId,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    }).catch(() => {});
  }
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logout berhasil.' });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, message: 'OK.', data: user });
  } catch (e) {
    next(e);
  }
}
