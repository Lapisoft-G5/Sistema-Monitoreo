/**
 * Permisos de navegación por rol.
 *
 * Fase 1 de PLAN_REMEDIACION.md: el tipo `UserRole` y el diccionario
 * `ROLE_LABELS` que este archivo declaraba se trasladaron al contrato
 * compartido. Se reexportan desde aquí por compatibilidad; el punto de
 * importación se retira en la Fase 7.
 *
 * `ROLE_PERMISSIONS` sigue siendo una matriz estática mantenida a mano y
 * paralela al mapa de capacidades del backend (`shared/auth/capability-map.ts`).
 * Unificar ambas es trabajo de la Fase 2, no de esta.
 */

export { ROLE_LABELS, type UserRole } from '@sistema-monitoreo/shared-contracts';

import { RoleCode, type UserRole } from '@sistema-monitoreo/shared-contracts';

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
  | 'plantillas_ugel'
  | 'plantillas_ies'
  | 'instituciones'
  | 'instituciones_padron'
  | 'instituciones_padron_lista'
  | 'instituciones_padron_personal'
  | 'instituciones_docentes'
  | 'instituciones_coordinadores'
  | 'instituciones_jefes_taller'
  | 'especialistas'
  | 'jefes_area'
  | 'focos_atencion'
  | 'solicitudes_visita'
  | 'reportes'
  | 'configuracion'
  | 'superadmin'
  | 'superadmin_director'
  | 'superadmin_jefe';

const BASE_PERMISSIONS: MenuItem[] = ['reportes'];

// La entrada `admin` se retiró aquí: concedía 22 de los 28 ítems de menú —el
// conjunto más amplio del sistema— a un rol que el backend nunca podía emitir.
// No figura en `RoleCode`, no lo siembra `database/seeders/auth.js` y ni
// `ADMIN_ROLES` lo incluía. El rol que gestiona altos cargos es `superusuario`.
export const ROLE_PERMISSIONS: Record<UserRole, MenuItem[]> = {
  director_ugel: [
    'dashboard',
    'focos_atencion',
    'reportes',
    'monitoreo_reportes'
  ],

  jefe_gestion: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'plantillas',
    'plantillas_ugel',
    'plantillas_ies',
    'especialistas',
    'jefes_area',
    'focos_atencion',
    'solicitudes_visita',
    'reportes',
    'monitoreo_reportes',
    'instituciones_padron',
    'instituciones_docentes',
  ],

  jefe_area: [
    'instituciones_padron',
    'instituciones_docentes',
    'monitoreo',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'focos_atencion',
    'solicitudes_visita',
    'reportes',
    'monitoreo_reportes',
  ],

  coordinador_pedagogico: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'monitoreo_reportes',
    'plantillas',
    'plantillas_ies',
    'reportes',
  ],

  jefe_taller: [
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'monitoreo_reportes',
    'plantillas',
    'plantillas_ies',
    'reportes',
  ],

  especialista: [
    'monitoreo',
    'monitoreo_calendario',
    'focos_atencion',
    'solicitudes_visita',
    'reportes',
    'monitoreo_reportes',
  ],

  director_institucion: [
    'dashboard',
    'monitoreo',
    'monitoreo_plan_anual',
    'monitoreo_cronograma',
    'monitoreo_calendario',
    'plantillas',
    'plantillas_ugel',
    'plantillas_ies',
    'instituciones_docentes',
    'instituciones_coordinadores',
    'instituciones_jefes_taller',
    'monitoreo_reportes',
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
    'plantillas_ugel',
    'plantillas_ies',
    'instituciones',
    'instituciones_padron',
    'instituciones_docentes',
    'instituciones_coordinadores',
    'especialistas',
    'reportes',
    'configuracion',
  ],
  superusuario: ['superadmin', 'superadmin_director', 'superadmin_jefe'],
};

import { READ_ONLY_ROLES } from '@sistema-monitoreo/shared-contracts';

// ── FUNCIONES DE VERIFICACIÓN Y UTILS ──

export const hasPermission = (role: UserRole, item: MenuItem): boolean =>
  (ROLE_PERMISSIONS[role] ?? []).includes(item);

export const isReadOnlyRole = (role: UserRole): boolean => READ_ONLY_ROLES.includes(role);

export const getDefaultLandingPage = (role: UserRole): string => {
  switch (role) {
    case RoleCode.SUPERUSUARIO:
      return '/superadmin';
    case 'jefe_area':
      return '/instituciones/padron';
    case 'jefe_gestion':
      return '/especialistas';
    case 'especialista':
      return '/monitoreo/calendario';
    case 'director_institucion':
      return '/dashboard';
    case 'coordinador_pedagogico':
    case 'jefe_taller':
      return '/monitoreo/calendario';
    case 'docente':
      return '/reportes';
    default:
      return '/dashboard';
  }
};
