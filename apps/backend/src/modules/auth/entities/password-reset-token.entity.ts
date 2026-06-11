import { Usuario } from './user.entity.js';

export class PasswordResetToken {
  id!: string;
  usuarioId!: string;
  tokenHash!: string;
  expiresAt!: Date;
  isUsed!: boolean;
  usedAt!: Date | null;
  requestedIp!: string | null;
  createdAt!: Date;

  usuario?: Usuario;
}
