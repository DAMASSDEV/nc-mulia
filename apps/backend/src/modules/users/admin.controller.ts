import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { parseErrors } from '../../middleware/error.js';

const membershipSchema = z.object({
  membershipStatus: z.enum(['regular', 'member']),
  membershipExpiresAt: z.string().optional().nullable(),
});

const statusSchema = z.object({
  isActive: z.boolean(),
});

export async function updateMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = membershipSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }
    const updateData: Record<string, unknown> = { membershipStatus: parsed.data.membershipStatus.toUpperCase() };
    if (parsed.data.membershipStatus === 'member') {
      updateData.membershipExpiresAt = parsed.data.membershipExpiresAt ? new Date(parsed.data.membershipExpiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      updateData.membershipExpiresAt = null;
    }
    const updated = await prisma.user.update({ where: { id: req.params.id as string }, data: updateData });
    res.json({
      success: true,
      message: 'Membership berhasil diperbarui.',
      data: {
        id: updated.id,
        membershipStatus: updated.membershipStatus.toLowerCase(),
        membershipExpiresAt: updated.membershipExpiresAt?.toISOString() ?? null,
        membershipActive: updated.membershipStatus === 'MEMBER' && (!updated.membershipExpiresAt || updated.membershipExpiresAt > new Date()),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }
    const updated = await prisma.user.update({ where: { id: req.params.id as string }, data: { isActive: parsed.data.isActive } });
    res.json({ success: true, message: 'Status berhasil diperbarui.', data: { id: updated.id, isActive: updated.isActive } });
  } catch (e) {
    next(e);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string }, select: { id: true, name: true, email: true, phone: true, role: true, membershipStatus: true, membershipExpiresAt: true, isActive: true, createdAt: true } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
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
