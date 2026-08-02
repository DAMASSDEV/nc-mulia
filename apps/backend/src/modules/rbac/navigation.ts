import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/db.js';

export async function getNavigation(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.user!;

    // Find the role(s) for this user
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: { select: { id: true, slug: true } } },
    });

    if (!userRoles.length) {
      res.json({ success: true, message: 'OK.', data: [] });
      return;
    }

    // Get navigation items visible to any of the user's roles
    const roleIds = userRoles.map(ur => ur.roleId);
    const navItems = await prisma.navigationItem.findMany({
      where: {
        isActive: true,
        audience: 'ADMIN',
        roleVisibility: { some: { roleId: { in: roleIds } } },
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      include: { parent: { select: { key: true, label: true, iconKey: true, route: true } } },
    });

    res.json({ success: true, message: 'OK.', data: navItems });
  } catch (e) {
    next(e);
  }
}
