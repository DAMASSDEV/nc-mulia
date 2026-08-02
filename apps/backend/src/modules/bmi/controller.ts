import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BmiService } from './service.js';
import { parseErrors } from '../../middleware/error.js';

const service = new BmiService();

const calcSchema = z.object({ weightKg: z.number().positive(), heightCm: z.number().positive() });
const querySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), search: z.string().optional() });

export async function calculate(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = calcSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const { weightKg, heightCm } = parsed.data;
    const result = await service.createRecord(req.user!.userId, weightKg, heightCm);
    res.status(201).json({ success: true, message: 'BMI berhasil dihitung.', data: result });
  } catch (e) { next(e); }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await service.getHistory(req.user!.userId);
    res.json({ success: true, message: 'OK.', data: records });
  } catch (e) { next(e); }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const data = parsed.success ? parsed.data : {};
    const result = await service.getAll(data);
    res.json({ success: true, message: 'OK.', data: result });
  } catch (e) { next(e); }
}
