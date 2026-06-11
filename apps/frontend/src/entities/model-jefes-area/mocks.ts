import type { JefeArea } from './model';

export const MOCK_JEFES_AREA: JefeArea[] = [
  {
    id: 'ja-1',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez López',
    dni: '45678901',
    correo: 'jperez@ugel-lampa.gob.pe',
    celular: '951234567',
    activo: true,
    fechaCreacion: '2024-01-15',
  },
  {
    id: 'ja-2',
    nombres: 'Lucía',
    apellidos: 'Mamani Apaza',
    dni: '23456789',
    correo: 'lmamani@ugel-lampa.gob.pe',
    celular: '952345678',
    activo: true,
    fechaCreacion: '2024-02-20',
  },
  {
    id: 'ja-3',
    nombres: 'Roberto',
    apellidos: 'Quispe Ccopa',
    dni: '34567890',
    correo: 'rquispe@ugel-lampa.gob.pe',
    celular: '953456789',
    activo: false,
    fechaCreacion: '2024-03-12',
  },
];
