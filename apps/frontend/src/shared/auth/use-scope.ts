import { useMemo } from 'react';
import {
  RoleCode,
  getRoleScope,
  isUgelRole,
  isInstitutionRole,
  MONITOR_CAMPO_ROLES,
  type RoleScope,
} from '@sistema-monitoreo/shared-contracts';
import { useUser } from '@entities/model-user';

/**
 * Ámbito organizativo del usuario autenticado.
 *
 * Complementa a `useCan()`. Son preguntas distintas y ambas hacen falta:
 *
 *   useCan()   → «¿puede ejecutar esta acción?»       (autorización)
 *   useScope() → «¿desde qué lado de la organización  (ámbito)
 *                 mira esta pantalla?»
 *
 * Un especialista de UGEL y un director de institución comparten la capacidad
 * `monitoreo:execute`, pero ven vistas distintas del calendario: el primero
 * recorre instituciones, el segundo consulta la propia. Esa diferencia es de
 * ámbito, no de permiso, y resolverla con capacidades daría el resultado
 * equivocado.
 *
 * Fase 2 de PLAN_REMEDIACION.md.
 */
export const useScope = () => {
  const { user } = useUser();
  const rol = user?.role as RoleCode | undefined;

  return useMemo(() => {
    const scope: RoleScope | null = rol ? getRoleScope(rol) : null;

    return {
      /** Ámbito del usuario, o `null` si no hay sesión. */
      scope,
      /** Pertenece a la UGEL. */
      isUgel: rol ? isUgelRole(rol) : false,
      /** Pertenece al personal de una institución educativa. */
      isInstitution: rol ? isInstitutionRole(rol) : false,
      /**
       * Levanta la ficha de monitoreo en el aula. Cruza ambos ámbitos a
       * propósito: incluye al especialista de UGEL y al coordinador pedagógico
       * y jefe de taller, que son personal de institución.
       */
      isMonitorCampo: rol ? MONITOR_CAMPO_ROLES.includes(rol) : false,
      /** Dirige una institución educativa. */
      isDirectorInstitucion: rol === RoleCode.DIRECTOR_INSTITUCION,
    };
  }, [rol]);
};
