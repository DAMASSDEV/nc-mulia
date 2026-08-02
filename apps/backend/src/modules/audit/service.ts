import { prisma } from '../../lib/db.js';

export interface AuditLogInput {
  actorUserId: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      module: input.module,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeData: input.beforeData ?? undefined,
      afterData: input.afterData ?? undefined,
      metadata: input.metadata ?? undefined,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

export async function listAuditLogs(query: {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  userId?: string;
  entityType?: string;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const where: Record<string, unknown> = {};
  if (query.module) where.module = query.module;
  if (query.action) where.action = query.action;
  if (query.userId) where.actorUserId = query.userId;
  if (query.entityType) where.entityType = query.entityType;

  const [records, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return {
    records: records.map(r => ({
      id: r.id,
      action: r.action,
      module: r.module,
      entityType: r.entityType,
      entityId: r.entityId,
      beforeData: r.beforeData,
      afterData: r.afterData,
      metadata: r.metadata,
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      createdAt: r.createdAt.toISOString(),
      actor: r.actor ? { id: r.actor.id, name: r.actor.name, email: r.actor.email } : null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
