import { Role } from './role.entity.js';
import { Persona } from './persona.entity.js';

export class User {
  id!: string;
  personaId!: string;
  roleId!: string;
  passwordHash!: string;
  isActive!: boolean;
  isFirstLogin!: boolean;
  failedLoginAttempts!: number;
  lockedUntil!: Date | null;
  lastLoginAt!: Date | null;
  lastFailedLoginAt!: Date | null;
  passwordChangedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  persona?: Persona;
  role?: Role;
}
