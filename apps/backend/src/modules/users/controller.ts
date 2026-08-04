import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UsersService } from './service.js';
import { parseErrors } from '../../middleware/error.js';
import { createAuditLog } from '../audit/service.js';
import { getClientIp, getUserAgent } from '../../lib/audit.js';

const service = new UsersService();

const querySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  membershipStatus: z.enum(['regular', 'member']).optional(),
  membershipExpiresAt: z.string().optional(),
});

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Parameter tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const result = await service.list(parsed.data);
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const before = await service.getById(req.params.id as string);
    const user = await service.update(req.params.id as string, parsed.data);
    await createAuditLog({
      actorUserId: req.user!.userId,
      action: 'update',
      module: 'users',
      entityType: 'user',
      entityId: user.id,
      beforeData: before,
      afterData: user,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
    res.json({ success: true, message: 'Pengguna berhasil diperbarui.', data: user });
  } catch (e) {
    next(e);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await service.getById(req.params.id as string);
    const result = await service.deactivate(req.params.id as string);
    await createAuditLog({
      actorUserId: req.user!.userId,
      action: 'delete',
      module: 'users',
      entityType: 'user',
      entityId: req.params.id as string,
      beforeData: before,
      afterData: result,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
    res.json({ success: true, message: 'Pengguna berhasil dinonaktifkan.', data: result });
  } catch (e) {
    next(e);
  }
}
