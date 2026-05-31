import { User } from '../entities/user.entity.js';
import { AuthSession } from '../entities/auth-session.entity.js';

export abstract class AuthRepository {
  abstract findUserByDni(dni: string): Promise<User | null>;
  abstract findUserById(id: string): Promise<User | null>;
  abstract createSession(data: CreateSessionData): Promise<AuthSession>;
  abstract updateLastLogin(userId: string, now: Date): Promise<void>;
  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;
  abstract incrementFailedAttempts(userId: string, now: Date): Promise<number>;
  abstract lockAccount(userId: string, until: Date): Promise<void>;
  abstract resetFailedAttempts(userId: string): Promise<void>;
}

export interface CreateSessionData {
  userId: string;
  sessionJti: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}
