import { BaseEntity } from '../../../shared/types/base.entity.js';
import { Usuario } from './user.entity.js';

export class PasswordResetToken extends BaseEntity {
  usuarioId!: string;
  tokenHash!: string;
  expiresAt!: Date;
  isUsed!: boolean;
  usedAt!: Date | null;
  requestedIp!: string | null;

  usuario?: Usuario;
}
