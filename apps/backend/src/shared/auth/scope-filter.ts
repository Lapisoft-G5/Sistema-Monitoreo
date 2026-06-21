import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { RoleCode } from '../../common/enums/role.enum.js';

/**
 * Contexto de scope que recibe ScopeFilter. Construido a partir del
 * `req.user` (JwtPayload) en el service que llama.
 */
export interface ScopeContext {
  userId: string;
  role: RoleCode;
  /**
   * id de la institucion a la que el usuario esta vinculado (para
   * director_institucion / coordinador_pedagogico / jefe_taller / docente).
   * Null para usuarios UGEL (jefe_gestion, jefe_area, especialista, director_ugel, invitado).
   */
  institucionId?: string | null;
  /**
   * nivelEducativo del Especialista (jefe_area). Necesario para filtrar
   * instituciones por nivel en `forInstitucion`.
   */
  especialistaNivel?: string | null;
}

/**
 * ScopeFilter — helper centralizado que traduce el `ScopeContext` del
 * usuario en `Prisma.<Model>WhereInput` para los queries.
 *
 * Patrones soportados:
 *  - ALL      : jefe_gestion, director_ugel, invitado. Ven todo.
 *  - INSTITUCION: director_institucion, coord_pedagogico, jefe_taller.
 *               Ven solo lo de su institucionId.
 *  - MONITOR  : especialista. Ve solo donde es el monitor (cronograma/ficha).
 *  - SCOPE_JEFE_AREA: jefe_area. Filtra por nivel educativo (reglas
 *                    distintas segun Inicial / Primaria / Secundaria).
 *  - OWN      : docente. Ve solo lo propio.
 *
 * Si el `institucionId` es null pero el rol lo necesita para filtrar,
 * el filtro retorna `{ id: '__none__' }` (un sentinel que no matchea
 * ninguna fila) para que la query devuelva vacio. Esto evita leaks
 * por falta de datos de scope.
 */
@Injectable()
export class ScopeFilter {
  // ── Predicados de scope ─────────────────────────────────────────────

  isAllScope(role: RoleCode): boolean {
    return (
      role === RoleCode.JEFE_GESTION ||
      role === RoleCode.DIRECTOR_UGEL ||
      role === RoleCode.INVITADO
    );
  }

  isInstitucionScope(role: RoleCode): boolean {
    return (
      role === RoleCode.DIRECTOR_INSTITUCION ||
      role === RoleCode.COORDINADOR_PEDAGOGICO ||
      role === RoleCode.JEFE_TALLER
    );
  }

  isMonitorScope(role: RoleCode): boolean {
    return role === RoleCode.ESPECIALISTA;
  }

  isJefeAreaScope(role: RoleCode): boolean {
    return role === RoleCode.JEFE_AREA;
  }

  isOwnScope(role: RoleCode): boolean {
    return role === RoleCode.DOCENTE;
  }

  // ── Filtros por entidad ─────────────────────────────────────────────

  /**
   * Filtro para Cronograma.
   *  - ALL: empty
   *  - INSTITUCION: institucionId == ctx.institucionId
   *  - MONITOR: monitorId == ctx.userId
   *  - JEFE_AREA: institucionId in (IEs de su nivel)
   *  - DOCENTE: empty (los docentes no consultan cronogramas, pero por
   *              seguridad devolvemos algo consistente con su rol)
   */
  forCronograma(ctx: ScopeContext): Prisma.CronogramaWhereInput {
    if (this.isAllScope(ctx.role)) return {};
    if (this.isInstitucionScope(ctx.role)) {
      return ctx.institucionId ? { institucionId: ctx.institucionId } : { id: '__none__' };
    }
    if (this.isMonitorScope(ctx.role)) {
      return { monitorId: ctx.userId };
    }
    if (this.isJefeAreaScope(ctx.role)) {
      // jefe_area ve todas las IEs de su nivel. Lo resolvemos en
      // el service que llama con un JOIN a instituciones para no acoplar
      // el filter a la tabla de instituciones.
      return { institucion: { nivelEducativo: ctx.especialistaNivel ?? '__none__' } };
    }
    // docente, invitado (en este caso): no aplica
    return { id: '__none__' };
  }

  /**
   * Filtro para FichaMonitoreo. Misma logica que cronograma pero el
   * Especialista mira `creadoPorId` en vez de `monitorId`. La IE no es
   * campo directo de FichaMonitoreo — va via `cronograma`.
   */
  forFicha(ctx: ScopeContext): Prisma.FichaMonitoreoWhereInput {
    if (this.isAllScope(ctx.role)) return {};
    if (this.isInstitucionScope(ctx.role)) {
      return ctx.institucionId
        ? { cronograma: { institucionId: ctx.institucionId } }
        : { id: '__none__' };
    }
    if (this.isMonitorScope(ctx.role)) {
      return { creadoPorId: ctx.userId };
    }
    if (this.isJefeAreaScope(ctx.role)) {
      return {
        cronograma: {
          institucion: { nivelEducativo: ctx.especialistaNivel ?? '__none__' },
        },
      };
    }
    // docente: ve solo fichas donde es el evaluado (docenteId == userId)
    return { id: '__none__' };
  }

  /**
   * Filtro para Institucion.
   *  - ALL: empty
   *  - JEFE_AREA: nivelEducativo == ctx.especialistaNivel Y modalidad
   *              permitida (reglas del dominio: Inicial->EBR+EBE,
   *              Primaria->EBR, Secundaria->EBR+EBA+CEPTRO)
   *  - INSTITUCION: institucionId == ctx.institucionId
   *  - MONITOR: institucionId in (IEs donde es monitor) — para Fase 3 lo dejamos vacio
   *  - OWN: institucionId == ctx.institucionId
   *  - DOCENTE: institucionId == ctx.institucionId
   */
  forInstitucion(ctx: ScopeContext): Prisma.InstitucionEducativaWhereInput {
    if (this.isAllScope(ctx.role)) return {};
    if (this.isJefeAreaScope(ctx.role)) {
      const nivel = ctx.especialistaNivel;
      if (!nivel) return { id: '__none__' };
      // Reglas del dominio (PROJECT_DOCUMENTATION §5.3):
      //  - Inicial: EBR Inicial o EBE (Especial)
      //  - Primaria: EBR Primaria
      //  - Secundaria: EBR Secundaria, EBA o CEPTRO
      if (nivel === 'Inicial') {
        return {
          OR: [
            { modalidad: 'EBE' },
            { modalidad: 'EBR', nivelEducativo: { equals: 'Inicial', mode: 'insensitive' } },
          ],
        };
      }
      if (nivel === 'Primaria') {
        return { modalidad: 'EBR', nivelEducativo: { equals: 'Primaria', mode: 'insensitive' } };
      }
      if (nivel === 'Secundaria') {
        return {
          OR: [
            { modalidad: 'EBR', nivelEducativo: { equals: 'Secundaria', mode: 'insensitive' } },
            { modalidad: 'EBA' },
            { modalidad: 'CEPTRO' },
          ],
        };
      }
      return { id: '__none__' };
    }
    if (this.isInstitucionScope(ctx.role) || this.isOwnScope(ctx.role)) {
      return ctx.institucionId ? { id: ctx.institucionId } : { id: '__none__' };
    }
    if (this.isMonitorScope(ctx.role)) {
      // Especialista: ve las IEs donde esta asignado como monitor.
      // Por ahora dejamos vacio (no es requerido para Fase 3).
      return {};
    }
    return { id: '__none__' };
  }

  /**
   * Filtro para Docente. Mismas reglas que Institucion (el director ve
   * los docentes de su IE, jefe_area los docentes de las IEs de su nivel,
   * jefe_gestion todo, etc.).
   */
  forDocente(ctx: ScopeContext): Prisma.DocenteWhereInput {
    if (this.isAllScope(ctx.role)) return {};
    if (this.isInstitucionScope(ctx.role) || this.isOwnScope(ctx.role)) {
      return ctx.institucionId ? { institucionId: ctx.institucionId } : { id: '__none__' };
    }
    if (this.isJefeAreaScope(ctx.role)) {
      return {
        institucion: {
          OR: [
            {
              modalidad: 'EBR',
              nivelEducativo: { equals: ctx.especialistaNivel ?? '__none__', mode: 'insensitive' },
            },
            { modalidad: 'EBE' },
            { modalidad: 'EBA' },
            { modalidad: 'CEPTRO' },
          ],
        },
      };
    }
    return { id: '__none__' };
  }

  /**
   * Filtro para Reporte (fichas_completadas, resumen_ie, etc.).
   * Misma logica que Ficha (porque los reportes derivan de fichas).
   */
  forReporte(ctx: ScopeContext): Prisma.FichaMonitoreoWhereInput {
    return this.forFicha(ctx);
  }
}
