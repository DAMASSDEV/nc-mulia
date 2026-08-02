import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as rbac from './service.js';
import { parseErrors } from '../../middleware/error.js';

const SUPER_ADMIN_SLUG = 'super_admin';

const roleSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z_]+$/, 'Slug hanya huruf kecil dan underscore'),
  description: z.string().max(255).optional(),
});

const permissionSetSchema = z.object({
  permissionKeys: z.array(z.string()),
});

const userRoleSchema = z.object({
  roleIds: z.array(z.string()),
});

// ── Roles ────────────────────────────────────────────────────────────────────

export async function listRoles(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await rbac.listRoles();
    res.json({ success: true, message: 'OK.', data: roles });
  } catch (e) { next(e); }
}

export async function getRole(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await rbac.getRoleById(req.params.id as string);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role tidak ditemukan.' });
      return;
    }
    res.json({ success: true, message: 'OK.', data: role });
  } catch (e) { next(e); }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
  try {
    // Only super_admin can create roles
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat membuat role.' });
      return;
    }
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const role = await rbac.createRole(parsed.data);
    res.status(201).json({ success: true, message: 'Role berhasil dibuat.', data: role });
  } catch (e) { next(e); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengubah role.' });
      return;
    }
    const parsed = roleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const role = await rbac.updateRole(req.params.id as string, parsed.data);
    res.json({ success: true, message: 'Role berhasil diperbarui.', data: role });
  } catch (e) { next(e); }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat menghapus role.' });
      return;
    }
    await rbac.deleteRole(req.params.id as string);
    res.json({ success: true, message: 'Role berhasil dihapus.' });
  } catch (e) { next(e); }
}

// ── Permissions ─────────────────────────────────────────────────────────────

export async function listPermissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await rbac.listPermissions();
    res.json({ success: true, message: 'OK.', data: permissions });
  } catch (e) { next(e); }
}

export async function setRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = permissionSetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    await rbac.setRolePermissions(req.params.roleId as string, parsed.data.permissionKeys);
    res.json({ success: true, message: 'Permission role berhasil diperbarui.' });
  } catch (e) { next(e); }
}

// ── Navigation ─────────────────────────────────────────────────────────────

export async function listNavigation(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await rbac.listNavigationItems();
    res.json({ success: true, message: 'OK.', data: items });
  } catch (e) { next(e); }
}

export async function getRoleNavigation(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await rbac.getRoleById(req.params.roleId as string);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role tidak ditemukan.' });
      return;
    }
    const items = await rbac.getNavigationForRole(role.id);
    res.json({ success: true, message: 'OK.', data: items });
  } catch (e) { next(e); }
}

export async function setRoleNavigation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = z.object({ navigationKeys: z.array(z.string()) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    await rbac.setRoleNavigation(req.params.roleId as string, parsed.data.navigationKeys);
    res.json({ success: true, message: 'Navigation role berhasil diperbarui.' });
  } catch (e) { next(e); }
}

// ── Discounts ─────────────────────────────────────────────────────────────────

export async function listDiscounts(_req: Request, res: Response, next: NextFunction) {
  try {
    const discounts = await rbac.listDiscounts();
    res.json({ success: true, message: 'OK.', data: discounts });
  } catch (e) { next(e); }
}

export async function updateDiscount(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = z.object({
      rate: z.number().min(0).max(1).optional(),
      isActive: z.boolean().optional(),
      label: z.string().min(1).max(200).optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const discount = await rbac.updateDiscount(req.params.key as string, parsed.data);
    res.json({ success: true, message: 'Discount berhasil diperbarui.', data: discount });
  } catch (e) { next(e); }
}

// ── User Roles ─────────────────────────────────────────────────────────────

export async function getUserPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const perms = await rbac.getUserPermissions(req.params.userId as string);
    res.json({ success: true, message: 'OK.', data: perms });
  } catch (e) { next(e); }
}

export async function setUserRoles(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'super_admin' && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Tidak memiliki hak untuk mengubah role user.' });
      return;
    }
    const parsed = userRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parseErrors(parsed.error) });
      return;
    }
    const targetUserId = req.params.userId as string;
    const isSelf = targetUserId === req.user!.userId;
    // Admins can only edit their own roles
    if (!isSelf && req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Tidak dapat mengubah role user lain.' });
      return;
    }
    // Check if assigning super_admin role
    const roleChecks = await Promise.all(parsed.data.roleIds.map((roleId) => rbac.getRoleById(roleId)));
    const hasSuperAdmin = roleChecks.some((role) => role && role.slug === SUPER_ADMIN_SLUG);
    if (hasSuperAdmin && req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat memberikan role Super Admin.' });
      return;
    }
    // Super admin cannot change their own roles
    if (isSelf && req.user!.role === 'super_admin') {
      res.status(403).json({ success: false, message: 'Tidak dapat mengubah role diri sendiri.' });
      return;
    }
    await rbac.setUserRoles(targetUserId, parsed.data.roleIds);
    res.json({ success: true, message: 'User role berhasil diperbarui.' });
  } catch (e) { next(e); }
}
