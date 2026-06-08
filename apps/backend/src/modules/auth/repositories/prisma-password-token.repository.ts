import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PasswordTokenRepository, CreateResetTokenData } from './password-token.repository.js';
import { PasswordResetToken } from '../entities/password-reset-token.entity.js';

@Injectable()
export class PrismaPasswordTokenRepository implements PasswordTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { persona: true } } },
    });
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
        data: { isUsed: true, usedAt: new Date() },
      }),
      this.prisma.authSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, loggedOutAt: new Date(), terminatedReason: 'PASSWORD_RESET' },
      }),
    ]);
  }
}
