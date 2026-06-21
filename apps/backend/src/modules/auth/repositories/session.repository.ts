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
  /**
   * Invalida TODAS las sesiones activas de un usuario.
   * Usado cuando cambian las capabilities del usuario (ej. cerrar un cargo).
   * Devuelve la cantidad de sesiones invalidadas.
   */
  abstract invalidateAllUserSessions(userId: string, reason: string): Promise<number>;
}
