import { prisma } from '../../lib/db.js';

export class ConsultationsService {
  async create(userId: string, question: string) {
    const c = await prisma.consultation.create({ data: { userId, question } });
    return { id: c.id, question: c.question, status: c.status.toLowerCase(), createdAt: c.createdAt.toISOString() };
  }

  async listByUser(userId: string) {
    const records = await prisma.consultation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return records.map(c => ({
      id: c.id,
      question: c.question,
      response: c.response,
      status: c.status.toLowerCase(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async listAll(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status.toUpperCase();

    const [records, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.consultation.count({ where }),
    ]);

    return {
      records: records.map(c => ({
        id: c.id,
        user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email } : undefined,
        question: c.question,
        response: c.response,
        status: c.status.toLowerCase(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, _userId: string, data: { response?: string; status?: 'pending' | 'answered' | 'closed' }) {
    const c = await prisma.consultation.findUnique({ where: { id } });
    if (!c) { const err: any = new Error('Konsultasi tidak ditemukan.'); err.statusCode = 404; throw err; }

    const updateData: Record<string, unknown> = {};
    if (data.response !== undefined) updateData.response = data.response;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();

    const updated = await prisma.consultation.update({ where: { id }, data: updateData });
    return {
      id: updated.id,
      question: updated.question,
      response: updated.response,
      status: updated.status.toLowerCase(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
