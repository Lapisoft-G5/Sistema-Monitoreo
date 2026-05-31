export type UserRole =
  | 'director_ugel'
  | 'especialista_admin'
  | 'especialista_medio'
  | 'especialista_bajo'
  | 'director_institucion'
  | 'docente'
  | 'invitado';

export const ROLE_LABELS: Record<UserRole, string> = {
  director_ugel:         'Director UGEL',
  especialista_admin:    'Especialista Admin',
  especialista_medio:    'Especialista Medio',
  especialista_bajo:     'Especialista Bajo',
  director_institucion:  'Director de Institución',
  docente:               'Docente',
  invitado:              'Invitado',
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

export const ROLE_PERMISSIONS: Record<UserRole, MenuItem[]> = {
  director_ugel: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'instituciones', 'instituciones_padron', 'instituciones_docentes',
    'especialistas',
    'reportes',
    'configuracion',
  ],
  especialista_admin: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'instituciones', 'instituciones_padron', 'instituciones_docentes',
    'especialistas',
    'reportes',
    'configuracion',
  ],
  especialista_medio: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'instituciones', 'instituciones_padron', 'instituciones_docentes',
    'reportes',
    'configuracion',
  ],
  especialista_bajo: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'reportes',
    'configuracion',
  ],
  director_institucion: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'instituciones_docentes',
    'reportes',
    'configuracion',
  ],
  docente: [
    'reportes',
    'configuracion',
  ],
  invitado: [
    'dashboard',
    'monitoreo', 'monitoreo_plan', 'monitoreo_gestion',
    'instituciones', 'instituciones_padron', 'instituciones_docentes',
    'especialistas',
    'reportes',
    'configuracion',
  ],
};