import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ConsultationsService } from './service.js';
import { parseErrors } from '../../middleware/error.js';

const service = new ConsultationsService();

const createSchema = z.object({ question: z.string().min(1) });
const updateSchema = z.object({ response: z.string().optional(), status: z.enum(['pending', 'answered', 'closed']).optional() });
const querySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), status: z.string().optional() });

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const c = await service.create(req.user!.userId, parsed.data.question);
    res.status(201).json({ success: true, message: 'Konsultasi berhasil dikirim.', data: c });
  } catch (e) { next(e); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await service.listByUser(req.user!.userId);
    res.json({ success: true, message: 'OK.', data: records });
  } catch (e) { next(e); }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const result = await service.listAll(parsed.success ? parsed.data : {});
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const c = await service.update(req.params.id as string, req.user!.userId, parsed.data);
    res.json({ success: true, message: 'Konsultasi berhasil diperbarui.', data: c });
  } catch (e) { next(e); }
}
