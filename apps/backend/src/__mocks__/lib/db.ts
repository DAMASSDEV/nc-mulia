import { vi } from 'vitest';

export const prisma = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  product: { findMany: vi.fn() },
  transaction: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  payment: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  chatConversation: { findUnique: vi.fn() },
  chatMessage: { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
  bmiRecord: { create: vi.fn() },
};
