/**
 * Contrato canónico de roles — fuente única de verdad del sistema.
 *
 * Fase 1 de PLAN_REMEDIACION.md.
 *
 * Antes de este archivo existían cuatro declaraciones de rol en el repositorio:
 * el enum `RoleCode` del backend, dos copias literales del tipo `UserRole` en el
 * frontend (`shared/constants/roles.ts` y `entities/model-user/constants.ts`) y
 * un `UserRole` huérfano en `domain.constants.ts` que no correspondía a ninguna
 * realidad del sistema. La duplicación ya había producido deriva observable: las
 * dos copias del frontend rotulaban `director_ugel` de forma distinta.
 *
 * Los valores coinciden con la columna `codigo` de la tabla `Role`, sembrada por
 * `database/seeders/auth.js`. El backend los emite en el JWT desde
 * `auth-token.service.ts`, de modo que este contrato es también el conjunto de
 * valores que el frontend puede recibir.
 *
 * `RoleCode` se declara como objeto `as const` y no como `enum` de TypeScript
 * porque debe consumirse desde ambas aplicaciones: el objeto existe en tiempo de
 * ejecución sin depender de la emisión de enums, y el tipo derivado sigue siendo
 * la unión exacta de sus valores. El acceso `RoleCode.DIRECTOR_UGEL` no cambia.
 *
 * Al agregar un rol, TypeScript señalará todo `Record<RoleCode, …>` incompleto
 * —empezando por `ROL_CAPABILITIES` del backend y `ROLE_LABELS` de aquí—, que es
 * exactamente la propiedad que este contrato existe para garantizar.
 */

/** Códigos de rol. Corresponden a `Role.codigo` en la base de datos. */
export const RoleCode = {
  DIRECTOR_UGEL: 'director_ugel',
  JEFE_AREA: 'jefe_area',
  JEFE_GESTION: 'jefe_gestion',
  ESPECIALISTA: 'especialista',
  DIRECTOR_INSTITUCION: 'director_institucion',
  COORDINADOR_PEDAGOGICO: 'coordinador_pedagogico',
  JEFE_TALLER: 'jefe_taller',
  DOCENTE: 'docente',
  INVITADO: 'invitado',
  SUPERUSUARIO: 'superusuario',
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

/**
 * Alias histórico usado por el frontend. Se conserva para no forzar un renombrado
 * masivo en esta fase; `RoleCode` es el nombre preferido en código nuevo.
 */
export type UserRole = RoleCode;

/** Todos los códigos de rol, en orden jerárquico descendente. */
export const ALL_ROLE_CODES: readonly RoleCode[] = Object.values(RoleCode);

/** Etiqueta legible por persona. Fuente única: no duplicar en las aplicaciones. */
export const ROLE_LABELS: Record<RoleCode, string> = {
  [RoleCode.DIRECTOR_UGEL]: 'Director de UGEL',
  [RoleCode.JEFE_AREA]: 'Jefe de Área',
  [RoleCode.JEFE_GESTION]: 'Jefe de Gestión',
  [RoleCode.ESPECIALISTA]: 'Especialista',
  [RoleCode.DIRECTOR_INSTITUCION]: 'Director de Institución',
  [RoleCode.COORDINADOR_PEDAGOGICO]: 'Coordinador Pedagógico',
  [RoleCode.JEFE_TALLER]: 'Jefe de Taller',
  [RoleCode.DOCENTE]: 'Docente',
  [RoleCode.INVITADO]: 'Invitado',
  [RoleCode.SUPERUSUARIO]: 'Super Administrador',
};

// ── Agrupaciones lógicas ─────────────────────────────────────────────────────
// Se declaran una sola vez y se consumen desde ambas aplicaciones. No son un
// modelo de autorización: la decisión de si un usuario puede ejecutar una acción
// la toma el mapa de capacidades del backend (`shared/auth/capability-map.ts`).
// Estas agrupaciones sólo describen a qué ámbito organizativo pertenece un rol.

/** Roles con alcance sobre toda la UGEL. */
export const UGEL_ROLES: readonly RoleCode[] = [
  RoleCode.DIRECTOR_UGEL,
  RoleCode.JEFE_AREA,
  RoleCode.JEFE_GESTION,
  RoleCode.ESPECIALISTA,
];

/** Roles cuyo alcance se limita a una institución educativa. */
export const INSTITUTION_ROLES: readonly RoleCode[] = [
  RoleCode.DIRECTOR_INSTITUCION,
  RoleCode.COORDINADOR_PEDAGOGICO,
  RoleCode.JEFE_TALLER,
  RoleCode.DOCENTE,
];

/** Roles sin capacidad de mutar datos. */
export const READ_ONLY_ROLES: readonly RoleCode[] = [RoleCode.INVITADO];

/**
 * Verifica en tiempo de ejecución que un valor arbitrario sea un código de rol
 * conocido. Necesario en la frontera con la base de datos: `Role.codigo` es una
 * columna de texto y el backend la convertía con una aserción sin comprobar.
 */
export function isRoleCode(value: unknown): value is RoleCode {
  return typeof value === 'string' && (ALL_ROLE_CODES as readonly string[]).includes(value);
}
