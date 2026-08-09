import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LocationsService } from './service.js';
import { parseErrors } from '../../middleware/error.js';
import { createAuditLog } from '../audit/service.js';
import { getClientIp, getUserAgent } from '../../lib/audit.js';

const service = new LocationsService();

const scheduleSchema = z.object({
  day: z.string().min(1).max(50),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  isClosed: z.boolean().default(false),
  sortOrder: z.number().optional(),
});

const locationSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  placeId: z.string().max(100).optional().nullable(),
  address: z.string().min(2).max(500),
  city: z.string().min(2).max(100),
  province: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().max(200).optional().nullable().or(z.literal('')),
  whatsapp: z.string().max(30).optional().nullable(),
  mapsUrl: z.string().max(1000).optional().nullable().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  openingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })).optional().nullable(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().optional().nullable(),
  schedules: z.array(scheduleSchema).optional().nullable(),
});

const statusSchema = z.object({
  isActive: z.boolean(),
});

export async function listLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const onlyActive = req.query.active === 'true';
    const locations = await service.list(onlyActive);
    res.json({ success: true, message: 'OK.', data: locations });
  } catch (e) {
    next(e);
  }
}

export async function getLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const location = await service.getById(id);
    if (!location) {
      res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
      return;
    }
    res.json({ success: true, message: 'OK.', data: location });
  } catch (e) {
    next(e);
  }
}

export async function getPrimary(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await service.list(false);
    const primary = locations.find(l => l.isPrimary) ?? locations[0] ?? null;
    res.json({ success: true, message: 'OK.', data: primary });
  } catch (e) {
    next(e);
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const location = await service.create(parsed.data);
    if (req.user?.userId) {
      createAuditLog({
        actorUserId: req.user.userId,
        action: 'create',
        module: 'locations',
        entityType: 'location',
        entityId: location.id,
        afterData: JSON.stringify(location),
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.status(201).json({ success: true, message: 'Lokasi berhasil ditambahkan.', data: location });
  } catch (e) {
    next(e);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = locationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const existing = await service.getById(req.params.id as string);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
      return;
    }
    const location = await service.update(req.params.id as string, parsed.data);
    if (req.user?.userId) {
      createAuditLog({
        actorUserId: req.user.userId,
        action: 'update',
        module: 'locations',
        entityType: 'location',
        entityId: location.id,
        beforeData: JSON.stringify(existing),
        afterData: JSON.stringify(location),
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Lokasi berhasil diperbarui.', data: location });
  } catch (e) {
    next(e);
  }
}

export async function deleteLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await service.getById(req.params.id as string);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
      return;
    }
    await service.remove(req.params.id as string);
    if (req.user?.userId) {
      createAuditLog({
        actorUserId: req.user.userId,
        action: 'delete',
        module: 'locations',
        entityType: 'location',
        entityId: req.params.id as string,
        beforeData: JSON.stringify(existing),
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Lokasi berhasil dihapus.' });
  } catch (e) {
    next(e);
  }
}

export async function setLocationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const existing = await service.getById(req.params.id as string);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
      return;
    }
    const location = await service.setActive(req.params.id as string, parsed.data.isActive);
    if (req.user?.userId) {
      createAuditLog({
        actorUserId: req.user.userId,
        action: 'update',
        module: 'locations',
        entityType: 'location',
        entityId: location.id,
        beforeData: JSON.stringify(existing),
        afterData: JSON.stringify(location),
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Status lokasi berhasil diperbarui.', data: location });
  } catch (e) {
    next(e);
  }
}

export async function setLocationPrimary(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await service.getById(req.params.id as string);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
      return;
    }
    const location = await service.setPrimary(req.params.id as string);
    if (req.user?.userId) {
      createAuditLog({
        actorUserId: req.user.userId,
        action: 'update',
        module: 'locations',
        entityType: 'location',
        entityId: location.id,
        beforeData: JSON.stringify(existing),
        afterData: JSON.stringify(location),
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Lokasi utama berhasil diperbarui.', data: location });
  } catch (e) {
    next(e);
  }
}
