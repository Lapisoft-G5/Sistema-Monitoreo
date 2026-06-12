import { PasswordResetToken } from '../entities/password-reset-token.entity.js';

export interface CreateResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  requestedIp?: string;
}

export abstract class PasswordTokenRepository {
  abstract createPasswordResetToken(data: CreateResetTokenData): Promise<void>;
  abstract findResetToken(tokenHash: string): Promise<PasswordResetToken | null>;
  abstract useResetToken(tokenId: string, userId: string, passwordHash: string): Promise<void>;
}
