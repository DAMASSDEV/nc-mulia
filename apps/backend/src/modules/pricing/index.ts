import { prisma } from '../../lib/db.js';

// Simple in-memory cache with TTL
let memberDiscountRate: number | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

export async function getMemberDiscountRate(): Promise<number> {
  const now = Date.now();
  if (memberDiscountRate !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return memberDiscountRate;
  }

  const discount = await prisma.discount.findUnique({ where: { key: 'member' } });
  memberDiscountRate = discount?.isActive ? discount.rate : 0;
  cacheTimestamp = now;
  return memberDiscountRate;
}

export async function getMembershipPlans() {
  return prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { isDefault: 'desc' },
  });
}

export async function getDefaultMembershipPlan() {
  const plan = await prisma.membershipPlan.findFirst({ where: { isActive: true, isDefault: true } });
  return plan ?? await prisma.membershipPlan.findFirst({ where: { isActive: true } });
}

export function clearDiscountCache() {
  memberDiscountRate = null;
  cacheTimestamp = 0;
}
