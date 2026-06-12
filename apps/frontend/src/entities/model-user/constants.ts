export type UserRole = 
  | 'director_ugel'
  | 'jefe_area'
  | 'jefe_gestion'
  | 'coordinador_pedagogico'
  | 'especialista'
  | 'director_institucion'
  | 'director_ie'
  | 'docente'
  | 'invitado';

// 2. Diccionario de constantes para usar en la UI (ej. en selects o tablas)
export const USER_ROLES_LABELS: Record<UserRole, string> = {
  director_ugel: 'Director de UGEL',
  jefe_area: 'Jefe de Área',
  jefe_gestion: 'Jefe de Gestión',
  coordinador_pedagogico: 'Coordinador Pedagógico',
  especialista: 'Especialista',
  director_institucion: 'Director de Institución',
  director_ie: 'Director de Institución',
  docente: 'Docente',
  invitado: 'Invitado',
};

// 3. Agrupaciones lógicas de roles para facilitar la validación
export const ADMIN_ROLES: UserRole[] = ['director_ugel', 'jefe_area'];
export const INSTITUTION_ROLES: UserRole[] = ['director_institucion', 'director_ie', 'docente'];
export const READ_ONLY_ROLES: UserRole[] = ['invitado'];