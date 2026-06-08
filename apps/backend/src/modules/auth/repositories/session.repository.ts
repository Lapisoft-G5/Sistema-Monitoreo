import { AuthSession } from '../entities/auth-session.entity.js';

export interface CreateSessionData {
  userId: string;
  sessionJti: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export abstract class SessionRepository {
  abstract createSession(data: CreateSessionData): Promise<AuthSession>;
  abstract invalidateSession(sessionJti: string, reason: string): Promise<void>;
  abstract isSessionActive(sessionJti: string): Promise<boolean>;
  abstract hasActiveSession(userId: string): Promise<boolean>;
}
