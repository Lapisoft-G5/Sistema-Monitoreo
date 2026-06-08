import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { AuditRepository, LogAuthEventData } from './audit.repository.js';

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logAuthEvent(data: LogAuthEventData): Promise<void> {
    await this.prisma.authAuditLog.create({
      data: {
        userId: data.userId ?? null,
        eventType: data.eventType,
        eventDetail: data.eventDetail ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }
}
