import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db.js';
import { env } from '../../config/env.js';

const METHOD_PROVIDERS: Record<string, string> = {
  qris: 'QRIS', bca: 'BCA Virtual Account', bri: 'BRI Virtual Account',
  bni: 'BNI Virtual Account', mandiri: 'Mandiri Virtual Account',
  ovo: 'OVO', gopay: 'GoPay', dana: 'DANA', shopeepay: 'ShopeePay',
};

function err(status: number, msg: string) {
  const e = Object.assign(new Error(msg), { statusCode: status });
  return e;
}

function generateRef() {
  return `SIM${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`;
}

function generateVa() {
  return `VA-${randomBytes(8).toString('hex').toUpperCase()}`;
}

function generateQrPayload(amount: number): string {
  const amt = Math.round(amount).toString().padStart(12, '0');
  return `00020101021226170011ID.CO.DANA.WWW021893000000000000510000000000000${amt}6304`;
}

interface PaymentRow {
  id: string;
  transactionId: string;
  method: string;
  provider: string;
  amount: unknown;
  referenceNumber: string;
  paymentCode: string | null;
  qrPayload: string | null;
  status: string;
  paidAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

const TX_MAP: Record<string, string> = {
  completed: 'PAID', failed: 'CANCELLED', expired: 'PENDING',
};

export class PaymentsService {
  async create(userId: string, transactionId: string, method: string) {
    if (!['qris', 'bca', 'bri', 'bni', 'mandiri', 'ovo', 'gopay', 'dana', 'shopeepay'].includes(method)) {
      throw err(400, 'Metode pembayaran tidak valid.');
    }

    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx) throw err(404, 'Transaksi tidak ditemukan.');
    if (tx.userId !== userId) throw err(403, 'Tidak diizinkan.');
    if (tx.status === 'CANCELLED') throw err(400, 'Transaksi sudah dibatalkan.');

    const pending = await prisma.payment.findFirst({ where: { transactionId, status: 'PENDING' } });
    if (pending) throw err(400, 'Sudah ada pembayaran pending.');

    const amount = Number(tx.finalTotal);
    const payment = await prisma.payment.create({
      data: {
        transactionId, userId,
        method: method as 'qris',
        provider: METHOD_PROVIDERS[method] ?? method,
        amount: new Prisma.Decimal(amount),
        referenceNumber: generateRef(),
        paymentCode: method === 'qris' ? null : generateVa(),
        qrPayload: method === 'qris' ? generateQrPayload(amount) : null,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await prisma.transaction.update({ where: { id: transactionId }, data: { status: 'AWAITING_PAYMENT' } });
    return this.fmt(payment);
  }

  async simulate(userId: string, paymentId: string, action: 'success' | 'failure' | 'expire') {
    if (env.PAYMENT_SIMULATION_ENABLED !== 'true') throw err(403, 'Simulasi dinonaktifkan.');

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw err(404, 'Pembayaran tidak ditemukan.');
    if (payment.userId !== userId) throw err(403, 'Tidak diizinkan.');

    const nxt = { success: 'COMPLETED', failure: 'FAILED', expire: 'EXPIRED' } as const;
    const allowed = { PENDING: ['PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'], PROCESSING: ['COMPLETED', 'FAILED'] };
    if (!allowed[payment.status as keyof typeof allowed]?.includes(nxt[action])) {
      throw err(400, `Tidak dapat mengubah status dari ${payment.status}.`);
    }

    const updateData: { status: string; paidAt?: Date } = { status: nxt[action] };
    if (nxt[action] === 'COMPLETED') updateData.paidAt = new Date();

    const updated = await prisma.payment.update({ where: { id: paymentId }, data: updateData as Parameters<typeof prisma.payment.update>[0]['data'] });
    const txStatus = TX_MAP[action] ?? payment.status;
    await prisma.transaction.update({ where: { id: payment.transactionId }, data: { status: txStatus as 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' } });

    return this.fmt(updated);
  }

  async listByUser(userId: string) {
    const payments = await prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return payments.map(p => this.fmt(p));
  }

  async listAll(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where: Record<string, string> = {};
    if (query.status) where.status = query.status.toUpperCase();

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map(p => ({ ...this.fmt(p), user: p.user ? { id: p.user.id, name: p.user.name, email: p.user.email } : undefined })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancelByUser(userId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw err(404, 'Pembayaran tidak ditemukan.');
    if (payment.userId !== userId) throw err(403, 'Tidak diizinkan.');
    if (payment.status !== 'PENDING') throw err(400, 'Hanya pending yang dapat dibatalkan.');

    const updated = await prisma.payment.update({ where: { id: paymentId }, data: { status: 'EXPIRED' } });
    const hasPending = await prisma.payment.findFirst({ where: { transactionId: payment.transactionId, status: 'PENDING', id: { not: paymentId } } });
    if (!hasPending) await prisma.transaction.update({ where: { id: payment.transactionId }, data: { status: 'PENDING' } });

    return this.fmt(updated);
  }

  private num(v: unknown) { return typeof v === 'number' ? v : Number(v); }

  private fmt(p: PaymentRow) {
    return {
      id: p.id, transactionId: p.transactionId, method: p.method, provider: p.provider,
      amount: this.num(p.amount), referenceNumber: p.referenceNumber,
      paymentCode: p.paymentCode, qrPayload: p.qrPayload,
      status: p.status.toLowerCase(), paidAt: p.paidAt?.toISOString() ?? null,
      expiresAt: p.expiresAt.toISOString(), createdAt: p.createdAt.toISOString(),
    };
  }
}
