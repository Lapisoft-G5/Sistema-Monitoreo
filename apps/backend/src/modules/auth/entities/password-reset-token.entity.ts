import { User } from './user.entity.js';

export class PasswordResetToken {
  id!: string;
  userId!: string;
  tokenHash!: string;
  expiresAt!: Date;
  isUsed!: boolean;
  usedAt!: Date | null;
  requestedIp!: string | null;
  createdAt!: Date;

  user?: User;
}
