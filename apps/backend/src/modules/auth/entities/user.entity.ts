import { Role } from './role.entity.js';

export class User {
  id!: string;
  roleId!: string;
  dni!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
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

  role?: Role;
}
