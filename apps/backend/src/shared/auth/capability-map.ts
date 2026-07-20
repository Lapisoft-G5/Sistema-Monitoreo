/**
 * Capability map — modelo de autorización dinámico del backend.
 *
 * Sprint 3 (Fase 1.5).
 *
 * Combina tres fuentes de capabilities:
 *   1. ROL_CAPABILITIES: lo que el rol `Usuario.rol` aporta (identidad de auth).
 *   2. ESPECIALISTA_CARGO_CAPABILITIES: lo que el cargo actual en la tabla
 *      Especialista aporta (Especialista | Jefe de Área | Jefe de Gestión).
 *   3. DOCENTE_CARGO_CAPABILITIES: lo que los cargos activos en la tabla
 *      `docente_cargos` aportan (Director, Coord. Ped., Jefe de Taller, etc.).
 *
 * Las capabilities efectivas son la UNIÓN de las tres, más BASE_CAPABILITIES
 * que toda persona tiene (derecho a ver sus propios reportes).
 *
 * El `es_principal` se asigna por CARGO_PRIORIDAD — el cargo activo de mayor
 * prioridad gana. Lo usa el router del frontend para decidir el landing.
 *
 * CARGO_COMPATIBILITY define qué cargos docentes pueden coexistir:
 *   - Director y Subdirector son únicos (no se combinan).
 *   - Coord. Ped., Jefe de Taller, PIP pueden combinarse con Docente de Aula.
 *   - Esto lo valida `canAddCargo()` antes de insertar un DocenteCargo.
 */

import { RoleCode } from '../../common/enums/role.enum.js';

export const CargoNombre = {
  DIRECTOR: 'Director',
  SUBDIRECTOR: 'Subdirector',
  COORDINADOR_PEDAGOGICO: 'Coordinador Pedagógico',
  JEFE_DE_TALLER: 'Jefe de Taller',
  DOCENTE_DE_AULA: 'Docente de Aula',
  PIP: 'PIP',
} as const;
export type CargoNombre = (typeof CargoNombre)[keyof typeof CargoNombre];

export const EspecialistaCargoEnum = {
  ESPECIALISTA: 'Especialista',
  JEFE_AREA: 'Jefe de Área',
  JEFE_GESTION: 'Jefe de Gestión',
} as const;
export type EspecialistaCargoEnum =
  (typeof EspecialistaCargoEnum)[keyof typeof EspecialistaCargoEnum];

/** Permisos base que toda persona tiene, independientemente de rol o cargo. */
export const BASE_CAPABILITIES: readonly string[] = ['reports:read', 'monitoreo:read'] as const;

/** Permisos derivados del ROL (identidad de autenticación del Usuario). */
export const ROL_CAPABILITIES: Record<RoleCode, readonly string[]> = {
  [RoleCode.DIRECTOR_UGEL]: ['dashboard:read', 'instituciones:read'],
  [RoleCode.JEFE_GESTION]: [
    'especialistas:read',
    'especialistas:write',
    'instituciones:read',
    'instituciones:write',
    'docentes:read',
    'docentes:write',
    'monitoreo:execute',
    'dashboard:read',
  ],
  [RoleCode.JEFE_AREA]: [
    'especialistas:read',
    'instituciones:read',
    'instituciones:write',
    'docentes:read',
    'docentes:write',
  ],
  [RoleCode.ESPECIALISTA]: [
    'monitoreo:execute',
    'especialistas:read',
    'instituciones:read',
    'docentes:read',
  ],
  [RoleCode.DIRECTOR_INSTITUCION]: [
    'dashboard:read',
    'docentes:read',
    'docentes:write',
    'monitoreo:execute',
    'especialistas:read',
    'instituciones:read',
  ],
  [RoleCode.COORDINADOR_PEDAGOGICO]: [
    'monitoreo:execute',
    'docentes:read',
    'especialistas:read',
    'instituciones:read',
  ],
  [RoleCode.JEFE_TALLER]: [
    'monitoreo:execute',
    'docentes:read',
    'especialistas:read',
    'instituciones:read',
  ],
  [RoleCode.DOCENTE]: [],
  [RoleCode.INVITADO]: ['dashboard:read'],
  [RoleCode.SUPERUSUARIO]: ['superadmin:access', 'especialistas:read', 'especialistas:write'],
};

/** Permisos derivados del cargo ACTIVO del Especialista (campo Especialista.cargo). */
export const ESPECIALISTA_CARGO_CAPABILITIES: Record<EspecialistaCargoEnum, readonly string[]> = {
  [EspecialistaCargoEnum.ESPECIALISTA]: ['monitoreo:execute'],
  [EspecialistaCargoEnum.JEFE_AREA]: [
    'especialistas:read',
    'monitoreo:execute',
    'instituciones:write',
    'docentes:write',
  ],
  [EspecialistaCargoEnum.JEFE_GESTION]: [
    'especialistas:write',
    'instituciones:write',
    'docentes:write',
  ],
};

/** Permisos derivados de los cargos ACTIVOS del docente (tabla docente_cargos). */
export const DOCENTE_CARGO_CAPABILITIES: Record<CargoNombre, readonly string[]> = {
  [CargoNombre.DIRECTOR]: [
    'dashboard:read',
    'instituciones:write',
    'docentes:write',
    'monitoreo:execute',
  ],
  [CargoNombre.SUBDIRECTOR]: ['docentes:write', 'monitoreo:execute'],
  [CargoNombre.COORDINADOR_PEDAGOGICO]: ['monitoreo:execute'],
  [CargoNombre.JEFE_DE_TALLER]: ['monitoreo:execute'],
  [CargoNombre.DOCENTE_DE_AULA]: [],
  [CargoNombre.PIP]: [],
};

/** Orden de prioridad para el campo `es_principal` (mayor gana). */
export const CARGO_PRIORIDAD: Record<CargoNombre, number> = {
  [CargoNombre.DIRECTOR]: 5,
  [CargoNombre.SUBDIRECTOR]: 4,
  [CargoNombre.COORDINADOR_PEDAGOGICO]: 3,
  [CargoNombre.JEFE_DE_TALLER]: 2,
  [CargoNombre.PIP]: 1,
  [CargoNombre.DOCENTE_DE_AULA]: 0,
};

/** Reglas de coexistencia de cargos docentes (validado a nivel service). */
export const CARGO_COMPATIBILITY: Record<
  CargoNombre,
  { canCombineWith: CargoNombre[]; isUnique: boolean }
> = {
  [CargoNombre.DIRECTOR]: { canCombineWith: [], isUnique: true },
  [CargoNombre.SUBDIRECTOR]: { canCombineWith: [], isUnique: true },
  [CargoNombre.COORDINADOR_PEDAGOGICO]: {
    canCombineWith: [CargoNombre.DOCENTE_DE_AULA],
    isUnique: false,
  },
  [CargoNombre.JEFE_DE_TALLER]: { canCombineWith: [CargoNombre.DOCENTE_DE_AULA], isUnique: false },
  [CargoNombre.PIP]: { canCombineWith: [CargoNombre.DOCENTE_DE_AULA], isUnique: false },
  [CargoNombre.DOCENTE_DE_AULA]: {
    canCombineWith: [
      CargoNombre.COORDINADOR_PEDAGOGICO,
      CargoNombre.JEFE_DE_TALLER,
      CargoNombre.PIP,
    ],
    isUnique: false,
  },
};

/**
 * Verifica si un docente puede recibir un nuevo cargo respetando las reglas de coexistencia.
 * Llamar antes de hacer `INSERT` en `docente_cargos` con `fecha_fin = NULL`.
 */
export function canAddCargo(currentCargos: CargoNombre[], nuevoCargo: CargoNombre): boolean {
  const rule = CARGO_COMPATIBILITY[nuevoCargo];
  if (rule.isUnique && currentCargos.length > 0) return false;
  return currentCargos.every((c) => CARGO_COMPATIBILITY[c].canCombineWith.includes(nuevoCargo));
}

/**
 * Calcula el `es_principal` para una lista de cargos docentes activos.
 * El de mayor prioridad gana.
 */
export function resolvePrincipalCargo(cargos: CargoNombre[]): CargoNombre | null {
  if (cargos.length === 0) return null;
  return cargos.reduce((best, current) =>
    CARGO_PRIORIDAD[current] > CARGO_PRIORIDAD[best] ? current : best,
  );
}

/**
 * Computa el array de capabilities efectivas del usuario:
 *   BASE ∪ ROL(rol) ∪ ESPECIALISTA_CARGO(espCargo) ∪ ∪ DOCENTE_CARGO(c) por cada cargo activo.
 */
export function computeEffectivePermissions(
  rol: RoleCode,
  especialistaCargo: EspecialistaCargoEnum | null,
  activeDocenteCargos: CargoNombre[],
): string[] {
  const fromRol = ROL_CAPABILITIES[rol] ?? [];
  const fromEsp = especialistaCargo
    ? (ESPECIALISTA_CARGO_CAPABILITIES[especialistaCargo] ?? [])
    : [];
  const fromCargos = activeDocenteCargos.flatMap((c) => DOCENTE_CARGO_CAPABILITIES[c] ?? []);
  return [...new Set([...BASE_CAPABILITIES, ...fromRol, ...fromEsp, ...fromCargos])];
}
