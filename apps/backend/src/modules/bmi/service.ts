import { prisma } from '../../lib/db.js';

const CATEGORIES = [
  { min: 0, max: 18.5, label: 'KURUS' as const },
  { min: 18.5, max: 25, label: 'NORMAL' as const },
  { min: 25, max: 30, label: 'KELebihan_BERAT' as const },
  { min: 30, max: Infinity, label: 'OBESITAS' as const },
];

const LABELS: Record<string, string> = {
  KURUS: 'Kurus',
  NORMAL: 'Normal',
  KELebihan_BERAT: 'Kelebihan Berat',
  OBESITAS: 'Obesitas',
  OVERWEIGHT: 'Kelebihan Berat',
  OBESITY: 'Obesitas',
};

export class BmiService {
  calculate(weightKg: number, heightCm: number) {
    const value = Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10;
    const cat = CATEGORIES.find(c => value >= c.min && value < c.max)?.label ?? 'OBESITAS';
    return { value, category: LABELS[cat] };
  }

  async createRecord(userId: string, weightKg: number, heightCm: number) {
    const { value, category } = this.calculate(weightKg, heightCm);
    const dbCategory = (category === 'Kelebihan Berat' || category === 'OVERWEIGHT')
      ? 'KELebihan_BERAT'
      : category === 'Kurus' ? 'KURUS'
      : category === 'Normal' ? 'NORMAL'
      : 'OBESITAS';

    const record = await prisma.bmiRecord.create({
      data: {
        userId,
        weight: weightKg,
        height: heightCm,
        bmi: value,
        bmiCategory: dbCategory as any,
      },
    });
    return this.format(record);
  }

  async getHistory(userId: string) {
    const records = await prisma.bmiRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return records.map(r => this.format(r));
  }

  async getAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where = query.search ? { user: { name: { contains: query.search, mode: 'insensitive' } } } : {};

    const [records, total] = await Promise.all([
      prisma.bmiRecord.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bmiRecord.count({ where }),
    ]);

    return {
      records: records.map(r => ({ id: r.id, user: { name: r.user?.name, email: r.user?.email }, weightKg: Number(r.weight), heightCm: Number(r.height), bmiValue: Number(r.bmi), bmiCategory: LABELS[r.bmiCategory] || r.bmiCategory, createdAt: r.createdAt.toISOString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private format(r: { id: string; weight: unknown; height: unknown; bmi: unknown; bmiCategory: string; createdAt: Date }) {
    return { id: r.id, weightKg: Number(r.weight), heightCm: Number(r.height), bmiValue: Number(r.bmi), bmiCategory: LABELS[r.bmiCategory] || r.bmiCategory, createdAt: r.createdAt.toISOString() };
  }
}
