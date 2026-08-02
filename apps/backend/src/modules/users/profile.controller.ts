import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { parseErrors } from '../../middleware/error.js';

const updateMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
});

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, name: true, email: true, phone: true, role: true, membershipStatus: true, membershipExpiresAt: true, isActive: true, createdAt: true } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      return;
    }
    res.json({
      success: true,
      message: 'OK.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.toLowerCase(),
        membershipStatus: user.membershipStatus.toLowerCase(),
        membershipStartedAt: user.createdAt.toISOString(),
        membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
        membershipActive: user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date()),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    const user = await prisma.user.update({ where: { id: req.user!.userId }, data: updateData, select: { id: true, name: true, email: true, phone: true, role: true, membershipStatus: true, membershipExpiresAt: true, isActive: true, createdAt: true } });
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.toLowerCase(),
        membershipStatus: user.membershipStatus.toLowerCase(),
        membershipStartedAt: user.createdAt.toISOString(),
        membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
        membershipActive: user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date()),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
}
