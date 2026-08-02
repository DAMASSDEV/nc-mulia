import type { Request, Response, NextFunction } from 'express';
import { MembershipService } from './service.js';

const service = new MembershipService();

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getStatus(req.user!.userId);
    res.json({ success: true, message: 'OK.', data });
  } catch (e) {
    next(e);
  }
}

export async function upgradeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.upgrade(req.params.userId as string, req.body.expiresAt);
    res.json({ success: true, message: 'Membership berhasil dinaikkan.', data });
  } catch (e) {
    next(e);
  }
}

export async function downgradeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.downgrade(req.params.userId as string);
    res.json({ success: true, message: 'Membership berhasil diturunkan.', data });
  } catch (e) {
    next(e);
  }
}

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await service.listPlans();
    res.json({ success: true, message: 'OK.', data: plans });
  } catch (e) {
    next(e);
  }
}

export async function getPlanFee(_req: Request, res: Response, next: NextFunction) {
  try {
    const fee = await service.getDefaultPlanFee();
    res.json({ success: true, message: 'OK.', data: { fee } });
  } catch (e) {
    next(e);
  }
}
