import type { Request, Response, NextFunction } from 'express';
import { getMembershipPlans, getDefaultMembershipPlan } from '../pricing/index.js';

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
