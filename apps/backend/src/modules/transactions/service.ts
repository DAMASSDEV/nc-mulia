import { prisma } from '../../lib/db.js';
import { getMemberDiscountRate } from '../pricing/index.js';
import { createAuditLog } from '../audit/service.js';

function err(status: number, msg: string) {
  const e = Object.assign(new Error(msg), { statusCode: status });
  return e;
}

// Valid status transitions: PENDING → AWAITING_PAYMENT | CANCELLED
// AWAITING_PAYMENT → PAID | CANCELLED
// PAID → PROCESSING | CANCELLED
// PROCESSING → COMPLETED | CANCELLED
// COMPLETED / CANCELLED are terminal (no outgoing transitions)
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['AWAITING_PAYMENT', 'CANCELLED'],
  AWAITING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class TransactionsService {
  async create(userId: string, items: Array<{ productId: string; quantity: number }>) {
    if (!items?.length) throw err(400, 'Keranjang tidak boleh kosong.');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw err(404, 'User tidak ditemukan.');

    const isMember = user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date());
    const productIds = items.map(i => i.productId);

    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of items) {
      if (!item.quantity || item.quantity < 1) throw err(400, 'Jumlah harus lebih dari 0.');
      const product = productMap.get(item.productId);
      if (!product) throw err(400, `Produk tidak ditemukan: ${item.productId}`);
      if (!product.isActive || !product.isAvailable) throw err(400, `Produk "${product.name}" tidak tersedia.`);
      if (product.stock < item.quantity) throw err(400, `Stok "${product.name}" tidak mencukupi. Tersedia: ${product.stock}`);
    }

    const discountRate = await getMemberDiscountRate();
    const priceItems = items.map(item => {
      const product = productMap.get(item.productId)!;
      const basePrice = Number(product.price);
      const discountPct = isMember && product.isMemberDiscountEligible ? discountRate * 100 : 0;
      const discountAmt = Math.round(basePrice * discountPct / 100);
      const finalPrice = basePrice - discountAmt;
      const subtotal = finalPrice * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        basePrice: basePrice,
        discountPercentage: discountPct,
        discountAmount: discountAmt,
        finalUnitPrice: finalPrice,
        subtotal: subtotal,
      };
    });

    const normalTotal = priceItems.reduce((s, i) => s + Number(i.basePrice) * i.quantity, 0);
    const totalDiscount = priceItems.reduce((s, i) => s + Number(i.discountAmount) * i.quantity, 0);
    const finalTotal = priceItems.reduce((s, i) => s + Number(i.subtotal), 0);

    // Atomic: create transaction + deduct stock in a single DB transaction
    const tx = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          membershipStatusSnapshot: isMember ? 'MEMBER' : 'REGULAR',
          normalTotal: normalTotal,
          totalDiscount: totalDiscount,
          finalTotal: finalTotal,
          status: 'PENDING',
          items: { create: priceItems },
        },
        include: { items: true },
      });

      // Deduct stock atomically within same transaction
      await Promise.all(items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ));

      return created;
    });

    return this.format(tx);
  }

  async listByUser(userId: string, query: { page?: number; limit?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const [records, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        include: { items: true, payments: { select: { id: true, method: true, status: true, amount: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      transactions: records.map(t => this.format(t)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listAll(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where: Record<string, unknown> = {};
    if (query.status && query.status !== 'undefined' && query.status !== 'all' && query.status !== 'ALL') {
      where.status = query.status.toUpperCase();
    }

    const [records, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, items: true, payments: { select: { id: true, method: true, status: true, amount: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: records.map(t => ({ ...this.format(t), user: t.user ? { id: t.user.id, name: t.user.name, email: t.user.email } : undefined })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, status: string, actorId: string, actorRole: string) {
    const valid = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!valid.includes(status)) throw err(400, 'Status tidak valid.');

    const existing = await prisma.transaction.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw err(404, 'Transaksi tidak ditemukan.');

    // No-op if already in target status
    if (existing.status === status) {
      return this.format({ ...existing, payments: [] } as any);
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(status)) {
      throw err(400, `Tidak dapat mengubah status dari ${existing.status} ke ${status}.`);
    }

    const previousStatus = existing.status;

    const tx = await prisma.$transaction(async (tx) => {
      // Restore stock if cancelling
      if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        await Promise.all(existing.items.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        ));
      }

      return tx.transaction.update({
        where: { id },
        data: { status: status as 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' },
        include: { items: true, payments: { select: { id: true, method: true, status: true, amount: true } } },
      });
    });

    // Audit log
    try {
      await createAuditLog({
        actorUserId: actorId,
        action: 'UPDATE',
        module: 'transactions',
        entityType: 'transaction',
        entityId: id,
        metadata: { previousStatus, newStatus: status, role: actorRole },
      });
    } catch { /* non-blocking */ }

    return this.format(tx);
  }

  private num(v: unknown) { return typeof v === 'number' ? v : Number(v); }

  private format(tx: { id: string; membershipStatusSnapshot: string; items: Array<{ productId: string; productName: string; quantity: number; basePrice: unknown; discountPercentage: unknown; discountAmount: unknown; finalUnitPrice: unknown; subtotal: unknown }>; normalTotal: unknown; totalDiscount: unknown; finalTotal: unknown; status: string; createdAt: Date; updatedAt: Date; payments?: Array<{ id: string; method: string; status: string; amount: unknown }> }) {
    return {
      id: tx.id,
      membershipStatusSnapshot: tx.membershipStatusSnapshot.toLowerCase(),
      items: tx.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        basePrice: this.num(i.basePrice),
        discountPercentage: this.num(i.discountPercentage),
        discountAmount: this.num(i.discountAmount),
        finalUnitPrice: this.num(i.finalUnitPrice),
        subtotal: this.num(i.subtotal),
      })),
      normalTotal: this.num(tx.normalTotal),
      totalDiscount: this.num(tx.totalDiscount),
      finalTotal: this.num(tx.finalTotal),
      status: tx.status.toLowerCase(),
      payments: tx.payments?.map(p => ({ id: p.id, method: p.method, status: p.status.toLowerCase(), amount: this.num(p.amount) })),
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    };
  }
}
