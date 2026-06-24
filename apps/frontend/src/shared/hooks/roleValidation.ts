import type { PersonaAutocompleteData, PersonaRoles } from '@shared/hooks/useDniAutocomplete';

export type RolObjetivo = 'director' | 'docente' | 'especialista' | 'jefe_area' | 'jefe_gestion';

export interface RoleCheckResult {
  /** True si la persona ya tiene el rol exacto que se intenta crear → debe BLOQUEAR el submit. */
  bloquea: boolean;
  /** True si la persona tiene al menos un rol distinto → advertencia informativa (no bloquea). */
  advierte: boolean;
  /** Mensaje para mostrar al usuario (naranja si advierte, rojo si bloquea). */
  mensaje: string;
  /** Texto de ayuda contextual (opcional). */
  detalle?: string;
}

const tieneDirector = (r: PersonaRoles): boolean => r.esDirector;
const tieneDocenteAula = (r: PersonaRoles): boolean =>
  r.esDocenteAula || r.esCoordinadorPedagogico || r.esJefeTaller;
const tieneAlgunaDocencia = (r: PersonaRoles): boolean =>
  r.esDocente || r.esDirector || r.esCoordinadorPedagogico || r.esJefeTaller;
const tieneEspecialista = (r: PersonaRoles, cargoObjetivo?: string): boolean => {
  if (!r.esEspecialista) return false;
  if (!cargoObjetivo) return true;
  return r.especialistaCargoActivo === cargoObjetivo;
};

/**
 * Valida si la persona ya registrada puede recibir el rol que se intenta crear.
 *
 * Reglas:
 * - Si la persona ya tiene el rol objetivo → BLOQUEA.
 * - Si la persona tiene un rol distinto (ej. Especialista → Docente) → ADVIERTE.
 * - Si no tiene ningún rol → OK sin mensaje.
 */
export const checkRoleConflict = (
  persona: PersonaAutocompleteData | null,
  rolObjetivo: RolObjetivo,
  cargoObjetivo?: string,
): RoleCheckResult => {
  if (!persona) {
    return { bloquea: false, advierte: false, mensaje: '' };
  }
  const r = persona.roles;

  switch (rolObjetivo) {
    case 'director':
      if (tieneDirector(r)) {
        return {
          bloquea: true,
          advierte: false,
          mensaje: 'Esta persona ya está registrada como Director de I.E.',
          detalle: 'No se puede crear un nuevo registro de Director para el mismo DNI.',
        };
      }
      if (tieneDocenteAula(r)) {
        return {
          bloquea: false,
          advierte: true,
          mensaje: 'Esta persona ya es docente en el sistema.',
          detalle:
            'Se creará un nuevo registro como Director además del rol docente existente.',
        };
      }
      if (r.esEspecialista) {
        return {
          bloquea: false,
          advierte: true,
          mensaje: `Esta persona ya está registrada como ${r.especialistaCargoActivo ?? 'Especialista'}.`,
          detalle: 'Se creará además un registro como Director de I.E.',
        };
      }
      return { bloquea: false, advierte: false, mensaje: '' };

    case 'docente':
      if (r.esDocente) {
        const cargosTxt = r.docenteCargosActivos.length
          ? r.docenteCargosActivos.join(', ')
          : 'docente';
        return {
          bloquea: true,
          advierte: false,
          mensaje: `Esta persona ya está registrada como docente (${cargosTxt}).`,
          detalle: 'No se puede crear un nuevo registro de Docente para el mismo DNI.',
        };
      }
      if (r.esEspecialista) {
        return {
          bloquea: false,
          advierte: true,
          mensaje: `Esta persona ya está registrada como ${r.especialistaCargoActivo ?? 'Especialista'}.`,
          detalle: 'Se creará además un registro como Docente de Aula.',
        };
      }
      return { bloquea: false, advierte: false, mensaje: '' };

    case 'especialista':
    case 'jefe_area':
    case 'jefe_gestion':
      if (tieneEspecialista(r, cargoObjetivo)) {
        return {
          bloquea: true,
          advierte: false,
          mensaje: `Esta persona ya está registrada como ${cargoObjetivo ?? r.especialistaCargoActivo ?? 'Especialista'}.`,
          detalle: 'No se puede crear un nuevo registro con este cargo para el mismo DNI.',
        };
      }
      if (tieneAlgunaDocencia(r)) {
        return {
          bloquea: false,
          advierte: true,
          mensaje: 'Esta persona ya es docente/director en el sistema.',
          detalle: `Se creará además un registro como ${cargoObjetivo ?? 'Especialista'}.`,
        };
      }
      return { bloquea: false, advierte: false, mensaje: '' };
  }
};
