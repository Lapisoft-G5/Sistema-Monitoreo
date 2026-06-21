/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';
import type {
  IReporteFicha,
  IReporteResumenIE,
  NivelLogro,
  TipoMonitoreo,
} from '@sistema-monitoreo/shared-contracts';
import {
  PaginatedFichas,
  QueryFichasCompletadas,
  ReporteRepository,
  SessionScope,
} from './reporte.repository.js';
import { RoleCode } from '../../../common/enums/role.enum.js';

@Injectable()
export class PrismaReporteRepository implements ReporteRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeFilter: ScopeFilter,
  ) {}

  private toScopeContext(session: SessionScope): ScopeContext {
    return {
      userId: session.id,
      role: session.role,
      institucionId: session.institucionId,
      especialistaNivel: session.especialistaNivel,
    };
  }

  async findFichasCompletadas(
    filters: QueryFichasCompletadas,
    session: SessionScope,
  ): Promise<PaginatedFichas> {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {
      estado: 'FINALIZADO',
      ...this.scopeFilter.forFicha(this.toScopeContext(session)),
    };
    if (filters.anioAcademico !== undefined) where.anioAcademico = filters.anioAcademico;
    if (filters.institucionId) where.institucionId = filters.institucionId;
    if (filters.tipoMonitoreo) {
      where.cronograma = { ...(where.cronograma ?? {}), tipoMonitoreo: filters.tipoMonitoreo };
    }
    if (filters.nivelLogro) where.nivelLogro = filters.nivelLogro;
    if (filters.fechaDesde || filters.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) where.createdAt.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.createdAt.lte = new Date(filters.fechaHasta);
    }

    const [rows, total] = await Promise.all([
      this.prisma.fichaMonitoreo.findMany({
        where,
        include: {
          cronograma: {
            include: {
              institucion: { select: { id: true, nombre: true, codigoModular: true } },
              evaluado: {
                include: { persona: { select: { nombres: true, apellidos: true } } },
              },
              monitor: {
                include: { persona: { select: { nombres: true, apellidos: true } } },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fichaMonitoreo.count({ where }),
    ]);

    const data: IReporteFicha[] = rows.map((f) => ({
      id: f.id,
      cronogramaId: f.cronogramaId,
      institucionId: f.cronograma.institucion.id,
      institucionNombre: f.cronograma.institucion.nombre,
      institucionCodigoModular: f.cronograma.institucion.codigoModular,
      evaluadoId: f.cronograma.evaluadoId,
      evaluadoNombre: `${f.cronograma.evaluado.persona.nombres} ${f.cronograma.evaluado.persona.apellidos}`,
      especialistaId: f.cronograma.monitorId,
      especialistaNombre: `${f.cronograma.monitor.persona.nombres} ${f.cronograma.monitor.persona.apellidos}`,
      tipoMonitoreo: f.cronograma.tipoMonitoreo as TipoMonitoreo,
      anioAcademico: f.anioAcademico,
      nivelLogro: f.nivelLogro as any,
      promedio: Number(f.promedio),
      puntajeTotal: f.puntajeTotal,
      estado: f.estado as any,
      fechaEjecucion: f.createdAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findResumenPorIE(
    anioAcademico: number,
    session: SessionScope,
  ): Promise<IReporteResumenIE[]> {
    const whereBase: any = {
      estado: 'FINALIZADO',
      anioAcademico,
    };
    const scopeFilter = this.scopeFilter.forFicha(this.toScopeContext(session));
    if (Object.keys(scopeFilter).length > 0) {
      Object.assign(whereBase, scopeFilter);
    }

    const fichas = await this.prisma.fichaMonitoreo.findMany({
      where: whereBase,
      include: {
        cronograma: {
          include: {
            institucion: { select: { id: true, nombre: true, codigoModular: true } },
          },
        },
      },
    });

    const porIe = new Map<string, { institucion: any; fichas: typeof fichas }>();
    for (const f of fichas) {
      const key = f.cronograma.institucion.id;
      if (!porIe.has(key)) {
        porIe.set(key, { institucion: f.cronograma.institucion, fichas: [] });
      }
      porIe.get(key)!.fichas.push(f);
    }

    const resumen: IReporteResumenIE[] = [];
    for (const { institucion, fichas: grupo } of porIe.values()) {
      const dist: Record<string, number> = {
        INICIO: 0,
        EN_PROCESO: 0,
        LOGRO_ESPERADO: 0,
        LOGRO_DESTACADO: 0,
      };
      let sumaPromedios = 0;
      let docentesCount = 0;
      let directivosCount = 0;
      for (const f of grupo) {
        dist[f.nivelLogro] = (dist[f.nivelLogro] ?? 0) + 1;
        sumaPromedios += Number(f.promedio);
        // Aproximacion: contamos por tipo via cronograma
        const cronograma = await this.prisma.cronograma.findUnique({
          where: { id: f.cronogramaId },
          select: { tipoMonitoreo: true },
        });
        if (cronograma?.tipoMonitoreo === 'DOCENTE') docentesCount++;
        else if (cronograma?.tipoMonitoreo === 'DIRECTIVO') directivosCount++;
      }
      const totalFichas = grupo.length;
      const promedioInstitucional =
        totalFichas > 0 ? Number((sumaPromedios / totalFichas).toFixed(2)) : 0;
      const totalNivelesAltos = dist.LOGRO_ESPERADO + dist.LOGRO_DESTACADO;
      const porcentajeSatisfaccion =
        totalFichas > 0 ? Math.round((totalNivelesAltos / totalFichas) * 100) : 0;

      resumen.push({
        institucionId: institucion.id,
        institucionNombre: institucion.nombre,
        institucionCodigoModular: institucion.codigoModular,
        totalFichas,
        totalDocentes: docentesCount,
        totalDirectivos: directivosCount,
        promedioInstitucional,
        distribucionNivelLogro: dist,
        porcentajeSatisfaccion,
      });
    }

    return resumen.sort((a, b) => b.totalFichas - a.totalFichas);
  }

  async findFichaByIdParaExport(id: string, session: SessionScope): Promise<IReporteFicha | null> {
    const f = await this.prisma.fichaMonitoreo.findUnique({
      where: { id },
      include: {
        cronograma: {
          include: {
            institucion: { select: { id: true, nombre: true, codigoModular: true } },
            evaluado: {
              include: { persona: { select: { nombres: true, apellidos: true } } },
            },
            monitor: {
              include: { persona: { select: { nombres: true, apellidos: true } } },
            },
          },
        },
      },
    });
    if (!f) return null;

    // Validar scope: si la ficha no matchea el filtro del usuario, no tiene acceso.
    const scope = this.scopeFilter.forFicha(this.toScopeContext(session));
    const allowed = await this.prisma.fichaMonitoreo.findFirst({
      where: { id: f.id, ...scope },
      select: { id: true },
    });
    if (!allowed) return null;

    return {
      id: f.id,
      cronogramaId: f.cronogramaId,
      institucionId: f.cronograma.institucion.id,
      institucionNombre: f.cronograma.institucion.nombre,
      institucionCodigoModular: f.cronograma.institucion.codigoModular,
      evaluadoId: f.cronograma.evaluadoId,
      evaluadoNombre: `${f.cronograma.evaluado.persona.nombres} ${f.cronograma.evaluado.persona.apellidos}`,
      especialistaId: f.cronograma.monitorId,
      especialistaNombre: `${f.cronograma.monitor.persona.nombres} ${f.cronograma.monitor.persona.apellidos}`,
      tipoMonitoreo: f.cronograma.tipoMonitoreo as TipoMonitoreo,
      anioAcademico: f.anioAcademico,
      nivelLogro: f.nivelLogro as any,
      promedio: Number(f.promedio),
      puntajeTotal: f.puntajeTotal,
      estado: f.estado as any,
      fechaEjecucion: f.createdAt.toISOString(),
    };
  }
}
