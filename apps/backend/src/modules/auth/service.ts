import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/db.js';
import { env } from '../../config/env.js';

const USER_ROLE_ID = 'seed_role_user';

export class AuthService {
  private async getUserRoleSlug(userId: string): Promise<string> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: { select: { slug: true } } },
    });
    if (!userRoles.length) return 'user';
    // Priority: super_admin > admin > user
    const slugs = userRoles.map(ur => ur.role.slug);
    if (slugs.includes('super_admin')) return 'super_admin';
    if (slugs.includes('admin')) return 'admin';
    return 'user';
  }

  async register(input: { name: string; email: string; phone?: string; passwordHash: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      const err: any = new Error('Email sudah terdaftar.');
      err.statusCode = 409;
      throw err;
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: input.passwordHash,
        role: 'USER',
        membershipStatus: 'REGULAR',
        isActive: true,
        userRoles: { create: { roleId: USER_ROLE_ID } },
      },
    });

    const roleSlug = await this.getUserRoleSlug(user.id);
    const token = jwt.sign(
      { userId: user.id, role: roleSlug },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: roleSlug,
      membershipStatus: user.membershipStatus.toLowerCase(),
    };
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) {
      const err: any = new Error('Email atau password salah.');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err: any = new Error('Akun dinonaktifkan. Hubungi admin.');
      err.statusCode = 403;
      throw err;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const err: any = new Error('Email atau password salah.');
      err.statusCode = 401;
      throw err;
    }

    const roleSlug = await this.getUserRoleSlug(user.id);
    const token = jwt.sign(
      { userId: user.id, role: roleSlug },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: roleSlug,
        membershipStatus: user.membershipStatus.toLowerCase(),
        membershipExpiresAt: user.membershipExpiresAt?.toISOString(),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, membershipStatus: true, membershipExpiresAt: true, isActive: true, createdAt: true },
    });
    if (!user) {
      const err: any = new Error('User tidak ditemukan.');
      err.statusCode = 404;
      throw err;
    }
    const roleSlug = await this.getUserRoleSlug(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: roleSlug,
      membershipStatus: user.membershipStatus.toLowerCase(),
      membershipExpiresAt: user.membershipExpiresAt?.toISOString(),
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }
}
