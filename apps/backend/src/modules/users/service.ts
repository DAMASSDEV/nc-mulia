import { prisma } from '../../lib/db.js';

export class UsersService {
  async getById(id: string) {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) { const err: any = new Error('Pengguna tidak ditemukan.'); err.statusCode = 404; throw err; }
    return {
      id: u.id, name: u.name, email: u.email, phone: u.phone,
      membershipStatus: u.membershipStatus.toLowerCase(),
      membershipExpiresAt: u.membershipExpiresAt?.toISOString(),
      isActive: u.isActive,
    };
  }

  async list(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const where = query.search ? {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, role: true, membershipStatus: true, membershipExpiresAt: true, isActive: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(u => ({
        id: u.id, name: u.name, email: u.email, phone: u.phone,
        role: u.role.toLowerCase() as 'admin' | 'user',
        membershipStatus: u.membershipStatus.toLowerCase() as 'regular' | 'member',
        membershipExpiresAt: u.membershipExpiresAt?.toISOString(),
        isActive: u.isActive, createdAt: u.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, data: { name?: string; phone?: string; role?: 'admin' | 'user'; membershipStatus?: 'regular' | 'member'; membershipExpiresAt?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { const err: any = new Error('Pengguna tidak ditemukan.'); err.statusCode = 404; throw err; }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role.toUpperCase() as 'ADMIN' | 'USER';
    if (data.membershipStatus !== undefined) {
      updateData.membershipStatus = data.membershipStatus.toUpperCase() as 'REGULAR' | 'MEMBER';
      if (data.membershipStatus === 'member' && !data.membershipExpiresAt) {
        updateData.membershipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      if (data.membershipStatus === 'regular') {
        updateData.membershipExpiresAt = null;
      }
    }
    if (data.membershipExpiresAt && data.membershipStatus === 'member') {
      updateData.membershipExpiresAt = new Date(data.membershipExpiresAt);
    }

    const updated = await prisma.user.update({ where: { id }, data: updateData });
    return {
      id: updated.id, name: updated.name, email: updated.email, phone: updated.phone,
      role: updated.role.toLowerCase() as 'admin' | 'user',
      membershipStatus: updated.membershipStatus.toLowerCase() as 'regular' | 'member',
      membershipExpiresAt: updated.membershipExpiresAt?.toISOString(),
      isActive: updated.isActive, createdAt: updated.createdAt.toISOString(),
    };
  }

  async deactivate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { const err: any = new Error('Pengguna tidak ditemukan.'); err.statusCode = 404; throw err; }
    const updated = await prisma.user.update({ where: { id }, data: { isActive: false } });
    return { id: updated.id, isActive: updated.isActive };
  }
}
