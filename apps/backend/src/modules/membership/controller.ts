import type { Request, Response, NextFunction } from 'express';
import { getMembershipPlans, getDefaultMembershipPlan } from '../pricing/index.js';
import { prisma } from '../../lib/db.js';

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await getMembershipPlans();
    res.json({ success: true, message: 'OK.', data: plans });
  } catch (e) { next(e); }
}

export async function getDefaultPlan(_req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await getDefaultMembershipPlan();
    if (!plan) {
      res.status(404).json({ success: false, message: 'Tidak ada paket membership.' });
      return;
    }
    res.json({ success: true, message: 'OK.', data: plan });
  } catch (e) { next(e); }
}

export async function purchaseMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        membershipStatus: 'MEMBER',
        membershipExpiresAt: expiresAt,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: userId,
        action: 'PURCHASE_MEMBERSHIP',
        module: 'MEMBERSHIP',
        entityType: 'User',
        entityId: userId,
        afterData: JSON.stringify({ membershipStatus: 'MEMBER', membershipExpiresAt: expiresAt }),
      },
    });

    res.json({
      success: true,
      message: 'Selamat! Pembayaran berhasil dan status akun Anda kini aktif sebagai MEMBER Herbalife.',
      data: {
        membershipStatus: user.membershipStatus,
        membershipExpiresAt: user.membershipExpiresAt,
        membershipActive: true,
      },
    });
  } catch (e) {
    next(e);
  }
}

