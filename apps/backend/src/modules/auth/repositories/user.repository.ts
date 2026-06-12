import { Usuario } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract findUserByDni(dni: string): Promise<Usuario | null>;
  abstract findUserById(id: string): Promise<Usuario | null>;
  abstract findUserByDniAndEmail(dni: string, email: string): Promise<Usuario | null>;
  abstract updateLastLogin(userId: string, now: Date): Promise<void>;
  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;
  abstract incrementFailedAttempts(userId: string, now: Date): Promise<number>;
  abstract lockAccount(userId: string, until: Date): Promise<void>;
  abstract resetFailedAttempts(userId: string): Promise<void>;
}
