import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { AuthRepository, CreateSessionData } from './auth.repository.js';
import { User } from '../entities/user.entity.js';
import { AuthSession } from '../entities/auth-session.entity.js';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user;
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

  async updateLastLogin(userId: string, now: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }
}
