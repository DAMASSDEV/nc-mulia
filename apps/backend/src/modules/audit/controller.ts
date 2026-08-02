import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as audit from './service.js';

const querySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  entityType: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.safeParse(req.query);
    const result = await audit.listAuditLogs(parsed.success ? parsed.data : {});
    res.json({ success: true, message: 'OK.', ...result });
  } catch (e) { next(e); }
}
