import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentsService } from './service.js';
import { parseErrors } from '../../middleware/error.js';

const service = new PaymentsService();

const createSchema = z.object({ transactionId: z.string(), method: z.string() });
const querySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), status: z.string().optional() });
const simulateSchema = z.object({ action: z.enum(['success', 'failure', 'expire']) });

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const payment = await service.create(req.user!.userId, parsed.data.transactionId, parsed.data.method);
    res.status(201).json({ success: true, message: 'Pembayaran dibuat.', data: payment });
  } catch (e) { next(e); }
}

export async function simulate(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = simulateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const result = await service.simulate(req.user!.userId, String(req.params.id), parsed.data.action);
    res.json({ success: true, message: 'Simulasi berhasil.', data: result });
  } catch (e) { next(e); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await service.listByUser(req.user!.userId);
    res.json({ success: true, message: 'OK.', data: payments });
  } catch (e) { next(e); }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const result = await service.listAll(parsed.success ? parsed.data : {});
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) { next(e); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.cancelByUser(req.user!.userId, String(req.params.id));
    res.json({ success: true, message: 'Pembayaran dibatalkan.', data: result });
  } catch (e) { next(e); }
}
