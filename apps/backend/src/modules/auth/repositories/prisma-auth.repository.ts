import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { AuthRepository, CreateSessionData, CreateResetTokenData } from './auth.repository.js';
import { User } from '../entities/user.entity.js';
import { AuthSession } from '../entities/auth-session.entity.js';
import { PasswordResetToken } from '../entities/password-reset-token.entity.js';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByDni(dni: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { dni },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user as unknown as User;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user as unknown as User;
  }

  async findUserByDniAndEmail(dni: string, email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        dni,
        email,
      },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user as unknown as User;
  }

  async createSession(data: CreateSessionData): Promise<AuthSession> {
    const session = await this.prisma.authSession.create({
      data: {
        userId: data.userId,
        sessionJti: data.sessionJti,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt,
        lastActivityAt: new Date(),
        isActive: true,
      },
    });

    return session;
  }

  async invalidateSession(sessionJti: string, reason: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { sessionJti },
      data: {
        isActive: false,
        loggedOutAt: new Date(),
        terminatedReason: reason,
      },
    });
  }

  async isSessionActive(sessionJti: string): Promise<boolean> {
    const session = await this.prisma.authSession.findUnique({
      where: { sessionJti },
      select: { isActive: true },
    });
    return session?.isActive === true;
  }

  async createPasswordResetToken(data: CreateResetTokenData): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        requestedIp: data.requestedIp ?? null,
        isUsed: false,
      },
    });
  }

  async findResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token) {
      return null;
    }

    return token as unknown as PasswordResetToken;
  }

  async useResetToken(tokenId: string, userId: string, passwordHash: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          isFirstLogin: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
          passwordChangedAt: new Date(),
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
    ]);
  }

  async updateLastLogin(userId: string, now: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        isFirstLogin: false,
        passwordChangedAt: new Date(),
      },
    });
  }

  async incrementFailedAttempts(userId: string, now: Date): Promise<number> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: now,
      },
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
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
}
