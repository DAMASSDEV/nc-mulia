import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserPermissions } from '../modules/rbac/service.js';

export type RoleSlug = 'super_admin' | 'admin' | 'user';

export interface AuthPayload {
  userId: string;
  role: RoleSlug;
}

declare module 'express' {
  interface Request {
    user?: AuthPayload & { permissions?: string[] };
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized.' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'user') {
    res.status(403).json({ success: false, message: 'Akses hanya untuk pengguna.' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Forbidden.' });
    return;
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Super admin access required.' });
    return;
  }
  next();
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    // Super admin bypasses permission check
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    try {
      const perms = await getUserPermissions(req.user.userId);
      if (!perms.includes(permission)) {
        res.status(403).json({ success: false, message: `Permission "${permission}" diperlukan.` });
        return;
      }
      req.user.permissions = perms;
      next();
    } catch {
      res.status(500).json({ success: false, message: 'Gagal memverifikasi permission.' });
    }
  };
}
