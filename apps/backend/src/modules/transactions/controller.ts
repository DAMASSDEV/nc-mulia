import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TransactionsService } from './service.js';
import { parseErrors } from '../../middleware/error.js';

const service = new TransactionsService();

const createSchema = z.object({ items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })) });
const querySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), status: z.string().optional() });
const updateStatusSchema = z.object({ status: z.enum(['pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'cancelled']) });

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const tx = await service.create(req.user!.userId, parsed.data.items);
    res.status(201).json({ success: true, message: 'Transaksi berhasil dibuat.', data: tx });
  } catch (e) { next(e); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const result = await service.listByUser(req.user!.userId, parsed.success ? parsed.data : {});
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) { next(e); }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const result = await service.listAll(parsed.success ? parsed.data : {});
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) { next(e); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Status tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const tx = await service.updateStatus(String(req.params.id), parsed.data.status);
    res.json({ success: true, message: 'Status diperbarui.', data: tx });
  } catch (e) { next(e); }
}
