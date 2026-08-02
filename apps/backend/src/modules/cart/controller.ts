import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CartService } from './service.js';
import { parseErrors } from '../../middleware/error.js';

const service = new CartService();

const addSchema = z.object({ productId: z.string(), quantity: z.number().int().positive() });
const updateSchema = z.object({ quantity: z.number().int().positive() });

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await service.getCart(req.user!.userId);
    res.json({ success: true, message: 'OK.', data: items });
  } catch (e) { next(e); }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const items = await service.addItem(req.user!.userId, parsed.data.productId, parsed.data.quantity);
    res.json({ success: true, message: 'Item ditambahkan ke keranjang.', data: items });
  } catch (e) { next(e); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) }); return; }
    const items = await service.updateItem(req.user!.userId, req.params.productId as string, parsed.data.quantity);
    res.json({ success: true, message: 'Jumlah diperbarui.', data: items });
  } catch (e) { next(e); }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await service.removeItem(req.user!.userId, req.params.productId as string);
    res.json({ success: true, message: 'Item dihapus dari keranjang.', data: items });
  } catch (e) { next(e); }
}

export async function clear(req: Request, res: Response, next: NextFunction) {
  try {
    await service.clear(req.user!.userId);
    res.json({ success: true, message: 'Keranjang dikosongkan.', data: [] });
  } catch (e) { next(e); }
}
