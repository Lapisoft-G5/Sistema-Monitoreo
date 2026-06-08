import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { SessionRepository, CreateSessionData } from './session.repository.js';
import { AuthSession } from '../entities/auth-session.entity.js';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: CreateSessionData): Promise<AuthSession> {
    return this.prisma.authSession.create({
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
  }

  async invalidateSession(sessionJti: string, reason: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { sessionJti },
      data: { isActive: false, loggedOutAt: new Date(), terminatedReason: reason },
    });
  }

  async isSessionActive(sessionJti: string): Promise<boolean> {
    const session = await this.prisma.authSession.findUnique({
      where: { sessionJti },
      select: { isActive: true },
    });
    return session?.isActive === true;
  }

  async hasActiveSession(userId: string): Promise<boolean> {
    const session = await this.prisma.authSession.findFirst({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    return !!session;
  }
}
