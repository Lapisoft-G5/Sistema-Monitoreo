export type UserRole =
  | 'director_ugel'
  | 'jefe_area'
  | 'jefe_gestion'
  | 'especialista'
  | 'director_institucion'
  | 'docente'
  | 'invitado';

export const ROLE_LABELS: Record<UserRole, string> = {
  director_ugel: 'Director UGEL',
  jefe_area: 'Jefe de Área',
  jefe_gestion: 'Jefe de Gestión',
  especialista: 'Especialista',
  director_institucion: 'Director de Institución',
  docente: 'Docente',
  invitado: 'Invitado',
};

export type MenuItem =
  | 'dashboard'
  | 'monitoreo'
  | 'monitoreo_plan'
  | 'monitoreo_gestion'
  | 'monitoreo_reportes'
  | 'instituciones'
  | 'instituciones_padron'
  | 'instituciones_docentes'
  | 'instituciones_coordinadores'
  | 'especialistas'
  | 'reportes'
  | 'configuracion';

const BASE_PERMISSIONS: MenuItem[] = ['reportes', 'configuracion'];

export const ROLE_PERMISSIONS: Record<UserRole, MenuItem[]> = {
  director_ugel: ['dashboard', 'reportes'],

  jefe_gestion: ['dashboard', 'monitoreo', 'monitoreo_reportes', 'especialistas', 'reportes'],

  jefe_area: ['instituciones_padron', 'instituciones_docentes', 'instituciones_coordinadores'],

  especialista: ['monitoreo', 'monitoreo_reportes', 'reportes'],

  director_institucion: [
    'instituciones_docentes',
    'reportes',
  ],

  docente: [...BASE_PERMISSIONS],

  invitado: [
    'dashboard',
    'monitoreo',
    'monitoreo_plan',
    'monitoreo_gestion',
    'monitoreo_reportes',
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
    'instituciones_coordinadores',
    'especialistas',
    'reportes',
    'configuracion',
  ],
};

const READ_ONLY_ROLES: UserRole[] = ['invitado'];

// ── FUNCIONES DE VERIFICACIÓN Y UTILS ──

export const hasPermission = (role: UserRole, item: MenuItem): boolean =>
  ROLE_PERMISSIONS[role].includes(item);

export const isReadOnlyRole = (role: UserRole): boolean => READ_ONLY_ROLES.includes(role);

export const getDefaultLandingPage = (role: UserRole): string => {
  switch (role) {
    case 'jefe_area':
      return '/instituciones/padron';
    case 'jefe_gestion':
      return '/dashboard';
    case 'especialista':
      return '/monitoreo/reportes';
    case 'director_institucion':
      return '/instituciones/docentes';
    case 'docente':
      return '/reportes';
    default:
      return '/dashboard';
  }
};
