import { prisma } from '../../lib/db.js';
import { getDefaultMembershipPlan } from '../pricing/index.js';

export class MembershipService {
  private MEMBER_DISCOUNT = 0.30;

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { membershipStatus: true, membershipExpiresAt: true } });
    if (!user) { const err: any = new Error('User tidak ditemukan.'); err.statusCode = 404; throw err; }
    const isActive = user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date());
    return { status: user.membershipStatus.toLowerCase(), expiresAt: user.membershipExpiresAt?.toISOString() ?? null, isActive };
  }

  async upgrade(userId: string, expiresAt?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { const err: any = new Error('User tidak ditemukan.'); err.statusCode = 404; throw err; }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        membershipStatus: 'MEMBER',
        membershipExpiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { status: updated.membershipStatus.toLowerCase(), expiresAt: updated.membershipExpiresAt!.toISOString() };
  }

  async downgrade(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { const err: any = new Error('User tidak ditemukan.'); err.statusCode = 404; throw err; }
    const updated = await prisma.user.update({ where: { id: userId }, data: { membershipStatus: 'REGULAR', membershipExpiresAt: null } });
    return { status: updated.membershipStatus.toLowerCase(), expiresAt: null };
  }

  calculateMemberPrice(basePrice: number, _userId?: string) {
    const discount = basePrice * this.MEMBER_DISCOUNT;
    return { finalPrice: basePrice - discount, discount, discountPercentage: this.MEMBER_DISCOUNT * 100, isMember: true };
  }

  async getUserMembership(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { membershipStatus: true, membershipExpiresAt: true, isActive: true } });
    if (!user || !user.isActive) return false;
    return user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date());
  }

  async applyMemberPricing(basePrice: number, userId: string) {
    const isMember = await this.getUserMembership(userId);
    if (!isMember) return { finalPrice: basePrice, discount: 0, discountPercentage: 0, isMember: false };
    return this.calculateMemberPrice(basePrice);
  }

  async getDefaultPlanFee(): Promise<number> {
    const plan = await getDefaultMembershipPlan();
    if (!plan) return 546000;
    return Number(plan.fee);
  }

  async listPlans() {
    return prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { isDefault: 'desc' } });
  }
}
