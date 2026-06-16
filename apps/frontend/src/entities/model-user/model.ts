import type { UserRole } from '@shared/constants/roles';

export interface User {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  role: UserRole;
  institucion?: string;
  institucionNombre?: string;
  institucionNivel?: string;
  especialistaNivel?: string;
  especialistaModalidad?: string;
  distrito?: string;
  firstLogin: boolean;
}
