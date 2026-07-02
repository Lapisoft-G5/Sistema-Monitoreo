import { BaseEntity } from '../../../shared/types/base.entity.js';
import { Role } from './role.entity.js';
import { Persona } from './persona.entity.js';

export class Usuario extends BaseEntity {
  personaId!: string;
  rolId!: string;
  passwordHash!: string;
  isActive!: boolean;
  isFirstLogin!: boolean;
  failedLoginAttempts!: number;
  lockedUntil!: Date | null;
  lastLoginAt!: Date | null;
  lastFailedLoginAt!: Date | null;
  passwordChangedAt!: Date | null;

  persona?: Persona;
  rol?: Role;
}
