import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { SessionRepository, CreateSessionData } from './session.repository.js';
import { AuthSession } from '../entities/auth-session.entity.js';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: CreateSessionData): Promise<AuthSession> {
    const session = await this.prisma.sesionAuth.create({
      data: {
        usuarioId: data.userId,
        sessionJti: data.sessionJti,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt,
        lastActivityAt: new Date(),
        isActive: true,
      },
    });
    return {
      id: session.id,
      usuarioId: session.usuarioId,
      sessionJti: session.sessionJti,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      loggedOutAt: session.loggedOutAt,
      terminatedReason: session.terminatedReason,
      isActive: session.isActive,
    };
  }

  async invalidateSession(sessionJti: string, reason: string): Promise<void> {
    await this.prisma.sesionAuth.updateMany({
      where: { sessionJti },
      data: { isActive: false, loggedOutAt: new Date(), terminatedReason: reason },
    });
  }

  async isSessionActive(sessionJti: string): Promise<boolean> {
    const session = await this.prisma.sesionAuth.findUnique({
      where: { sessionJti },
      select: { isActive: true },
    });
    return session?.isActive === true;
  }

  async hasActiveSession(userId: string): Promise<boolean> {
    const session = await this.prisma.sesionAuth.findFirst({
      where: { usuarioId: userId, isActive: true, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    return !!session;
  }

  async invalidateAllUserSessions(userId: string, reason: string): Promise<number> {
    const result = await this.prisma.sesionAuth.updateMany({
      where: { usuarioId: userId, isActive: true },
      data: {
        isActive: false,
        loggedOutAt: new Date(),
        terminatedReason: reason,
      },
    });
    return result.count;
  }
}
