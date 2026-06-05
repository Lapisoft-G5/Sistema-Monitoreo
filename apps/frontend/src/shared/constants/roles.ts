export type UserRole =
  | 'director_ugel'
  | 'especialista_admin'
  | 'especialista_medio'
  | 'especialista_bajo'
  | 'director_institucion'
  | 'docente'
  | 'invitado';

export const ROLE_LABELS: Record<UserRole, string> = {
  director_ugel:        'Director UGEL',
  especialista_admin:   'Especialista Admin',
  especialista_medio:   'Especialista Medio',
  especialista_bajo:    'Especialista Bajo',
  director_institucion: 'Director de Institución',
  docente:              'Docente',
  invitado:             'Invitado',
};

export type MenuItem =
  | 'dashboard'
  | 'monitoreo'
  | 'monitoreo_plan'
  | 'monitoreo_gestion'
  | 'instituciones'
  | 'instituciones_padron'
  | 'instituciones_docentes'
  | 'especialistas'
  | 'reportes'
  | 'configuracion';

const BASE_PERMISSIONS: MenuItem[] = ['reportes', 'configuracion'];

const STAFF_PERMISSIONS: MenuItem[] = [
  ...BASE_PERMISSIONS,
  'dashboard',
  'monitoreo',
  'monitoreo_plan',
  'monitoreo_gestion',
];

export const ROLE_PERMISSIONS: Record<UserRole, MenuItem[]> = {
  director_ugel: [
    ...STAFF_PERMISSIONS,
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
    'especialistas',
  ],

  especialista_admin: [
    ...STAFF_PERMISSIONS,
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
    'especialistas',
  ],

  especialista_medio: [
    ...STAFF_PERMISSIONS,
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
  ],

  especialista_bajo: [...STAFF_PERMISSIONS],

  director_institucion: [
    ...STAFF_PERMISSIONS,
    'instituciones',           // ← padre necesario para renderizar el grupo
    'instituciones_docentes',  // ← único submenu visible
                               // instituciones_padron NO incluido
  ],

  docente: [...BASE_PERMISSIONS],

  invitado: [
    'dashboard',
    'monitoreo',
    'monitoreo_plan',
    'monitoreo_gestion',
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
    'especialistas',
    'reportes',
    'configuracion',
  ],
};

const READ_ONLY_ROLES: UserRole[] = ['invitado'];

export const hasPermission = (role: UserRole, item: MenuItem): boolean =>
  ROLE_PERMISSIONS[role].includes(item);

export const isReadOnlyRole = (role: UserRole): boolean =>
  READ_ONLY_ROLES.includes(role);