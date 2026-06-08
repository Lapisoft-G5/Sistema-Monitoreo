import type { UserRole } from '@shared/constants/roles';

export interface User {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  role: UserRole;
  institucion?: string;
  distrito?: string;
  firstLogin: boolean;
}