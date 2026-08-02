import type { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from './service.js';

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, message: 'OK.', data: stats });
  } catch (e) { next(e); }
}
