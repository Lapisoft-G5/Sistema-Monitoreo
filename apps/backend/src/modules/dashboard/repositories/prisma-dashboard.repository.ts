import { Injectable } from '@nestjs/common';
import type {
  IDirectorDashboardMonitoreoReciente,
  IDirectorDashboardResponse,
  NivelLogro,
} from '@sistema-monitoreo/shared-contracts';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';
import { DashboardRepository, SessionScope } from './dashboard.repository.js';

/** Cuántos monitoreos recientes devuelve el dashboard. */
const RECIENTES_LIMIT = 5;

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
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

  async getDirectorDashboard(session: SessionScope): Promise<IDirectorDashboardResponse> {
    const ctx = this.toScopeContext(session);

    // 1. Institución del director (scope acotado a su IE).
    const institucion = await this.prisma.institucionEducativa.findFirst({
      where: this.scopeFilter.forInstitucion(ctx),
      select: {
        id: true,
        nombre: true,
        codigoModular: true,
        nivelEducativo: true,
        distrito: true,
      },
    });

    // 2. Docentes de la IE (para total y semáforo por docente).
    const docentes = await this.prisma.docente.findMany({
      where: { ...this.scopeFilter.forDocente(ctx), estado: 'Activo' },
      select: { id: true },
    });
    const totalDocentes = docentes.length;

    // 3. Fichas finalizadas de la IE, con datos para "recientes" y semáforo.
    const fichas = await this.prisma.fichaMonitoreo.findMany({
      where: { estado: 'FINALIZADO', ...this.scopeFilter.forFicha(ctx) },
      select: {
        id: true,
        nivelLogro: true,
        promedio: true,
        finalizadaAt: true,
        createdAt: true,
        cronograma: {
          select: {
            evaluadoId: true,
            nivelEducativo: true,
            evaluado: { select: { persona: { select: { nombres: true, apellidos: true } } } },
            monitor: { select: { persona: { select: { nombres: true, apellidos: true } } } },
          },
        },
      },
      orderBy: [{ finalizadaAt: 'desc' }, { createdAt: 'desc' }],
    });

    // Última ficha finalizada por docente (las fichas ya vienen ordenadas desc,
    // así que la primera que veamos por docente es la más reciente).
    const ultimaPorDocente = new Map<string, (typeof fichas)[number]>();
    for (const ficha of fichas) {
      const docenteId = ficha.cronograma.evaluadoId;
      if (!ultimaPorDocente.has(docenteId)) {
        ultimaPorDocente.set(docenteId, ficha);
      }
    }

    // 4. Semáforo — distribución de docentes por nivel de logro (última ficha).
    let critico = 0;
    let enProceso = 0;
    let logroPrevisto = 0;
    let sumaPromedios = 0;
    for (const ficha of ultimaPorDocente.values()) {
      const nivel = ficha.nivelLogro as NivelLogro;
      if (nivel === 'INICIO') critico += 1;
      else if (nivel === 'EN_PROCESO') enProceso += 1;
      else logroPrevisto += 1; // LOGRO_ESPERADO | LOGRO_DESTACADO
      sumaPromedios += Number(ficha.promedio);
    }
    const monitoreados = ultimaPorDocente.size;
    const pendientes = Math.max(totalDocentes - monitoreados, 0);
    const sinRegistro = pendientes;
    const nivelPromedio = monitoreados > 0 ? Number((sumaPromedios / monitoreados).toFixed(2)) : 0;
    const porcentajeCobertura =
      totalDocentes > 0 ? Math.round((monitoreados / totalDocentes) * 100) : 0;

    // 5. Monitoreos recientes (top N por fecha de finalización).
    const monitoreosRecientes: IDirectorDashboardMonitoreoReciente[] = fichas
      .slice(0, RECIENTES_LIMIT)
      .map((ficha) => {
        const evaluado = ficha.cronograma.evaluado.persona;
        const monitor = ficha.cronograma.monitor.persona;
        return {
          fichaId: ficha.id,
          docenteNombre: `${evaluado.nombres} ${evaluado.apellidos}`.trim(),
          especialistaNombre: `${monitor.nombres} ${monitor.apellidos}`.trim(),
          nivelEducativo: ficha.cronograma.nivelEducativo,
          fecha: (ficha.finalizadaAt ?? ficha.createdAt).toISOString(),
          nivelLogro: ficha.nivelLogro as NivelLogro,
          promedio: Number(ficha.promedio),
        };
      });

    return {
      institucion,
      kpis: {
        totalDocentes,
        monitoreados,
        pendientes,
        nivelPromedio,
        porcentajeCobertura,
      },
      semaforo: {
        critico,
        enProceso,
        logroPrevisto,
        sinRegistro,
      },
      monitoreosRecientes,
    };
  }
}
