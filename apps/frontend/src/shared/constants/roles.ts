export type UserRole =
  | 'director_ugel'
  | 'jefe_area'
  | 'jefe_gestion'
  | 'coordinador_pedagogico' // 🚀 Agregado para solucionar el error de TypeScript
  | 'jefe_taller'
  | 'especialista'
  | 'director_institucion'
  | 'director_ie' // 🚀 Fallback alias para base de datos local
  | 'docente'
  | 'invitado';

export const ROLE_LABELS: Record<UserRole, string> = {
  director_ugel: 'Director UGEL',
  jefe_area: 'Jefe de Área',
  coordinador_pedagogico: 'Coordinador Pedagógico', // 🚀 Corregido la etiqueta
  jefe_taller: 'Jefe de Taller',
  jefe_gestion: 'Jefe de Gestión',
  especialista: 'Especialista',
  director_institucion: 'Director de Institución',
  director_ie: 'Director de Institución',
  docente: 'Docente',
  invitado: 'Invitado',
};

export type MenuItem =
  | 'dashboard'
  | 'monitoreo'
  | 'monitoreo_plan'
  | 'monitoreo_gestion'
  | 'monitoreo_reportes'
  | 'monitoreo_plan_anual'
  | 'monitoreo_cronograma'
  | 'monitoreo_calendario'
  | 'plantillas'
  | 'instituciones'
  | 'instituciones_padron'
  | 'instituciones_docentes'
  | 'instituciones_coordinadores'
  | 'instituciones_jefes_taller'
  | 'especialistas'
  | 'jefes_area'
  | 'reportes'
  | 'configuracion';

const BASE_PERMISSIONS: MenuItem[] = ['reportes', 'configuracion'];

export const ROLE_PERMISSIONS: Record<UserRole, MenuItem[]> = {
  director_ugel: ['dashboard', 'reportes'],

  jefe_gestion: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'plantillas',
    'especialistas',
    'jefes_area',
    'reportes',
    'instituciones_padron',
    'instituciones_docentes',
  ],

  jefe_area: ['instituciones_padron', 'instituciones_docentes'],

  coordinador_pedagogico: [
    'monitoreo',
    'monitoreo_plan',
    'especialistas',
    'jefes_area',
    'reportes',
  ],

  jefe_taller: [
    'monitoreo',
    'monitoreo_plan',
    'especialistas',
    'jefes_area',
    'reportes',
  ],

  especialista: ['monitoreo', 'monitoreo_reportes', 'reportes'], // 🚀 Se eliminó la duplicación aquí

  director_institucion: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'instituciones_docentes',
    'instituciones_coordinadores',
    'instituciones_jefes_taller',
    'reportes',
  ],

  director_ie: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'instituciones_docentes',
    'instituciones_coordinadores',
    'instituciones_jefes_taller',
    'reportes',
  ],

  docente: [...BASE_PERMISSIONS],

  invitado: [
    'dashboard',
    'monitoreo',
    'monitoreo_plan',
    'monitoreo_gestion',
    'monitoreo_reportes',
    'plantillas',
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
  (ROLE_PERMISSIONS[role] ?? []).includes(item);

export const isReadOnlyRole = (role: UserRole): boolean => READ_ONLY_ROLES.includes(role);

export const getDefaultLandingPage = (role: UserRole): string => {
  switch (role) {
    case 'jefe_area':
      return '/instituciones/padron';
    case 'jefe_gestion':
      return '/especialistas';
    case 'especialista':
      return '/monitoreo/reportes';
    case 'director_institucion':
    case 'director_ie':
      return '/instituciones/docentes';
    case 'coordinador_pedagogico':
    case 'jefe_taller':
      return '/monitoreo/plan';
    case 'docente':
      return '/reportes';
    default:
      return '/dashboard';
  }
};
