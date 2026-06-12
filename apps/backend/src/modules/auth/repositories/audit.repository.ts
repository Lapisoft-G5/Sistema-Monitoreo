export interface LogAuthEventData {
  userId?: string;
  eventType: string;
  eventDetail?: string;
  ipAddress?: string;
  userAgent?: string;
}

export abstract class AuditRepository {
  abstract logAuthEvent(data: LogAuthEventData): Promise<void>;
}
