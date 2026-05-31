import type { UserRole } from '../../shared/constants/roles';

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

export const MOCK_USERS: Record<string, User> = {
  '76358911': {
    id: '1', dni: '76358911',
    nombres: 'Carlos Alberto', apellidos: 'Quispe Mamani',
    role: 'director_ugel', firstLogin: false,
  },
  '45678901': {
    id: '2', dni: '45678901',
    nombres: 'Juan', apellidos: 'Pérez López',
    role: 'especialista_admin', firstLogin: false,
  },
  '32145678': {
    id: '3', dni: '32145678',
    nombres: 'María', apellidos: 'Gómez Ticona',
    role: 'especialista_medio', firstLogin: false,
  },
  '12345678': {
    id: '4', dni: '12345678',
    nombres: 'Pedro', apellidos: 'Huanca Flores',
    role: 'especialista_bajo', firstLogin: false,
  },
  '87654321': {
    id: '5', dni: '87654321',
    nombres: 'Carlos', apellidos: 'Ruiz Condori',
    role: 'director_institucion',
    institucion: 'IE 70001 Huayta', distrito: 'LAMPA',
    firstLogin: false,
  },
  '11223344': {
    id: '6', dni: '11223344',
    nombres: 'Rosa', apellidos: 'Mamani Ccopa',
    role: 'docente', institucion: 'IE 70001 Huayta',
    firstLogin: false,
  },
  '99887766': {
    id: '7', dni: '99887766',
    nombres: 'Visitante', apellidos: 'Demo',
    role: 'invitado', firstLogin: false,
  },
};