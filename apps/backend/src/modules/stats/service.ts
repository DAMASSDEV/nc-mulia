import { prisma } from '../../lib/db.js';

export async function getDashboardStats() {
  try {
    const [totalUsers, totalProducts, totalConsultations, pendingConsultations, totalBmiRecords, totalTransactions, pendingTransactions] =
      await Promise.all([
        prisma.userRole.count({ where: { role: { slug: 'user' } } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.consultation.count(),
        prisma.consultation.count({ where: { status: 'PENDING' } }),
        prisma.bmiRecord.count(),
        prisma.transaction.count(),
        prisma.transaction.count({ where: { status: { in: ['PENDING', 'AWAITING_PAYMENT'] } } }),
      ]);

    const [recentConsultations, recentTransactions, recentBmi] = await Promise.all([
      prisma.consultation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.bmiRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    type ActivityType = 'consultation' | 'transaction' | 'bmi';

    const activityItems: Array<{
      id: string; type: ActivityType; text: string; time: string;
    }> = [];

    for (const c of recentConsultations) {
      const label = c.user?.name ?? 'Pengguna';
      const time = formatRelative(c.createdAt);
      if (c.status === 'PENDING') {
        activityItems.push({ id: `c-${c.id}`, type: 'consultation', text: `${label} mengajukan konsultasi baru`, time });
      } else {
        activityItems.push({ id: `c-${c.id}`, type: 'consultation', text: `Admin merespons konsultasi ${label}`, time });
      }
    }

    for (const t of recentTransactions) {
      const label = t.user?.name ?? 'Pengguna';
      activityItems.push({ id: `t-${t.id}`, type: 'transaction', text: `${label} membuat transaksi Rp ${Number(t.finalTotal).toLocaleString('id-ID')}`, time: formatRelative(t.createdAt) });
    }

    for (const b of recentBmi) {
      const label = b.user?.name ?? 'Pengguna';
      activityItems.push({ id: `b-${b.id}`, type: 'bmi', text: `${label} menghitung BMI: ${b.bmi}`, time: formatRelative(b.createdAt) });
    }

    activityItems.sort((a, b) => {
      const timeA = recentTime(a.type, a.id, recentConsultations, recentTransactions, recentBmi);
      const timeB = recentTime(b.type, b.id, recentConsultations, recentTransactions, recentBmi);
      return timeB.getTime() - timeA.getTime();
    });

    const recentActivity = activityItems.slice(0, 10);

    return { totalUsers, totalProducts, totalConsultations, pendingConsultations, totalBmiRecords, totalTransactions, pendingTransactions, recentActivity };
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalConsultations: 0,
      pendingConsultations: 0,
      totalBmiRecords: 0,
      totalTransactions: 0,
      pendingTransactions: 0,
      recentActivity: [],
    };
  }
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function recentTime(
  type: 'consultation' | 'transaction' | 'bmi',
  id: string,
  consultations: { id: string; createdAt: Date }[],
  transactions: { id: string; createdAt: Date }[],
  bmiRecords: { id: string; createdAt: Date }[],
): Date {
  const numId = id.replace(/^[ctb]-/, '');
  if (type === 'consultation') return consultations.find(c => c.id === numId)?.createdAt ?? new Date(0);
  if (type === 'transaction') return transactions.find(t => t.id === numId)?.createdAt ?? new Date(0);
  return bmiRecords.find(b => b.id === numId)?.createdAt ?? new Date(0);
}
