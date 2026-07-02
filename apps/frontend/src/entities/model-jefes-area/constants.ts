export const ACCIONES_JEFE_AREA = ['CRUD Directores', 'CRUD Instituciones Educativas'] as const;

export type AccionJefeArea = (typeof ACCIONES_JEFE_AREA)[number];
