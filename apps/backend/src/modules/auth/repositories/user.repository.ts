import { User } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract findUserByDni(dni: string): Promise<User | null>;
  abstract findUserById(id: string): Promise<User | null>;
  abstract findUserByDniAndEmail(dni: string, email: string): Promise<User | null>;
  abstract updateLastLogin(userId: string, now: Date): Promise<void>;
  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;
  abstract incrementFailedAttempts(userId: string, now: Date): Promise<number>;
  abstract lockAccount(userId: string, until: Date): Promise<void>;
  abstract resetFailedAttempts(userId: string): Promise<void>;
}
