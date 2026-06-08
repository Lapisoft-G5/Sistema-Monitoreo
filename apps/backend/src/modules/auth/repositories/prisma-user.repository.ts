import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { UserRepository } from './user.repository.js';
import { User } from '../entities/user.entity.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByDni(dni: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { persona: { dni } },
      include: { role: true, persona: { include: { docente: true } } },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, persona: true },
    });
  }

  async findUserByDniAndEmail(dni: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { persona: { dni, correo: email } },
      include: { role: true, persona: true },
    });
  }

  async updateLastLogin(userId: string, now: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, isFirstLogin: false, passwordChangedAt: new Date() },
      }),
      this.prisma.authSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, loggedOutAt: new Date(), terminatedReason: 'PASSWORD_CHANGED' },
      }),
    ]);
  }

  async incrementFailedAttempts(userId: string, now: Date): Promise<number> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 }, lastFailedLoginAt: now },
      select: { failedLoginAttempts: true },
    });
    return user.failedLoginAttempts;
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: until },
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }
}
