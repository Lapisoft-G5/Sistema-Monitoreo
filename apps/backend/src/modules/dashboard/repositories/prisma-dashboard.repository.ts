import { Injectable } from '@nestjs/common';
import type {
  IDirectorDashboardMonitoreoReciente,
  IDirectorDashboardResponse,
  IUgelDashboardCriticaIe,
  IUgelDashboardDistrito,
  IUgelDashboardIeMapa,
  IUgelDashboardMonitoreoReciente,
  IUgelDashboardResponse,
  NivelLogro,
} from '@sistema-monitoreo/shared-contracts';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';
import { DashboardRepository, SessionScope } from './dashboard.repository.js';

/** Cuántos monitoreos recientes devuelve el dashboard. */
const RECIENTES_LIMIT = 5;

/**
 * Clasifica un promedio institucional (0.00–4.00) en una categoría de semáforo,
 * replicando las bandas del baremo (EDU-0009: INICIO ≤1.5, EN_PROCESO ≤2.5,
 * LOGRO_ESPERADO ≤3.5, LOGRO_DESTACADO ≤4.0) sin lanzar en los límites.
 */
function clasificarSemaforo(promedio: number): 'critico' | 'enProceso' | 'logroPrevisto' {
  if (promedio <= 1.5) return 'critico';
  if (promedio <= 2.5) return 'enProceso';
  return 'logroPrevisto';
}

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

  async getUgelDashboard(
    session: SessionScope,
    anio: number,
  ): Promise<IUgelDashboardResponse> {
    const ctx = this.toScopeContext(session);
    // Límites de año en UTC: `fecha_programada` es @db.Date (medianoche UTC),
    // usar medianoche local desplazaría fechas de 1-ene / 31-dic al año vecino.
    const inicioAnio = new Date(Date.UTC(anio, 0, 1));
    const finAnio = new Date(Date.UTC(anio, 11, 31, 23, 59, 59));

    const institucionWhere = {
      estado: 'Activa',
      ...this.scopeFilter.forInstitucion(ctx),
    };

    // 1. KPIs institucionales: total y monitoreadas (con monitoreo COMPLETADO en el año).
    const [totalInstituciones, monitoreadas] = await Promise.all([
      this.prisma.institucionEducativa.count({ where: institucionWhere }),
      this.prisma.institucionEducativa.count({
        where: {
          ...institucionWhere,
          cronogramas: {
            some: {
              estado: 'COMPLETADO',
              fechaProgramada: { gte: inicioAnio, lte: finAnio },
            },
          },
        },
      }),
    ]);
    const pendientes = Math.max(totalInstituciones - monitoreadas, 0);
    const porcentajeCobertura =
      totalInstituciones > 0 ? Math.round((monitoreadas / totalInstituciones) * 100) : 0;

    // 2. Fichas finalizadas del año, con IE y especialista.
    const fichas = await this.prisma.fichaMonitoreo.findMany({
      where: { estado: 'FINALIZADO', anioAcademico: anio, ...this.scopeFilter.forFicha(ctx) },
      select: {
        id: true,
        nivelLogro: true,
        promedio: true,
        finalizadaAt: true,
        createdAt: true,
        cronograma: {
          select: {
            institucionId: true,
            nivelEducativo: true,
            tipoMonitoreo: true,
            evaluadoId: true,
            evaluado: { select: { persona: { select: { nombres: true, apellidos: true } } } },
            institucion: {
              select: {
                nombre: true,
                codigoModular: true,
                distrito: true,
                nivelEducativo: true,
              },
            },
            monitor: { select: { persona: { select: { nombres: true, apellidos: true } } } },
          },
        },
      },
      orderBy: [{ finalizadaAt: 'desc' }, { createdAt: 'desc' }],
    });

    // 3. Nivel promedio provincial (media de las fichas finalizadas).
    const nivelPromedio =
      fichas.length > 0
        ? Number(
            (fichas.reduce((acc, f) => acc + Number(f.promedio), 0) / fichas.length).toFixed(2),
          )
        : 0;

    // 4. Semáforo + "requieren atención" — clasificación de cada IE por su
    //    promedio institucional.
    type IeAcc = {
      suma: number;
      n: number;
      nombre: string;
      distrito: string;
      nivelEducativo: string;
    };
    const promediosPorIe = new Map<string, IeAcc>();
    for (const ficha of fichas) {
      const ieId = ficha.cronograma.institucionId;
      const ie = ficha.cronograma.institucion;
      const acc =
        promediosPorIe.get(ieId) ??
        ({
          suma: 0,
          n: 0,
          nombre: ie.nombre,
          distrito: ie.distrito,
          nivelEducativo: ie.nivelEducativo,
        } satisfies IeAcc);
      acc.suma += Number(ficha.promedio);
      acc.n += 1;
      promediosPorIe.set(ieId, acc);
    }

    let critico = 0;
    let enProceso = 0;
    let logroPrevisto = 0;
    for (const acc of promediosPorIe.values()) {
      const categoria = clasificarSemaforo(acc.suma / acc.n);
      if (categoria === 'critico') critico += 1;
      else if (categoria === 'enProceso') enProceso += 1;
      else logroPrevisto += 1;
    }
    const sinRegistro = Math.max(totalInstituciones - promediosPorIe.size, 0);

    // "Requieren atención" a nivel docente: docentes/directivos cuya ÚLTIMA ficha
    // está en INICIO, agrupados por su IE.
    const ultimaPorDocente = new Map<string, (typeof fichas)[number]>();
    for (const ficha of fichas) {
      const docId = ficha.cronograma.evaluadoId;
      if (!ultimaPorDocente.has(docId)) ultimaPorDocente.set(docId, ficha); // ya vienen desc
    }
    const iesAtencion = new Map<string, IUgelDashboardCriticaIe>();
    for (const ficha of ultimaPorDocente.values()) {
      if (ficha.nivelLogro !== 'INICIO') continue;
      const c = ficha.cronograma;
      let ie = iesAtencion.get(c.institucionId);
      if (!ie) {
        ie = {
          institucionId: c.institucionId,
          nombre: c.institucion.nombre,
          distrito: c.institucion.distrito,
          nivelEducativo: c.institucion.nivelEducativo,
          docentes: [],
        };
        iesAtencion.set(c.institucionId, ie);
      }
      const p = c.evaluado.persona;
      ie.docentes.push({
        docenteId: c.evaluadoId,
        nombre: `${p.nombres} ${p.apellidos}`.trim(),
        cargo: c.tipoMonitoreo === 'DIRECTIVO' ? 'Directivo' : 'Docente',
        promedio: Number(ficha.promedio),
        nivelLogro: 'INICIO',
      });
    }
    const requierenAtencion: IUgelDashboardCriticaIe[] = [...iesAtencion.values()];
    for (const ie of requierenAtencion) ie.docentes.sort((a, b) => a.promedio - b.promedio);
    requierenAtencion.sort((a, b) => b.docentes.length - a.docentes.length);

    // 4a-bis. II.EE. geolocalizadas para el mapa, con su estado de semáforo.
    const iesConCoord = await this.prisma.institucionEducativa.findMany({
      where: { ...institucionWhere, latitud: { not: null }, longitud: { not: null } },
      select: { id: true, nombre: true, distrito: true, latitud: true, longitud: true },
    });
    const institucionesMapa: IUgelDashboardIeMapa[] = iesConCoord.map((ie) => {
      const acc = promediosPorIe.get(ie.id);
      return {
        institucionId: ie.id,
        nombre: ie.nombre,
        distrito: ie.distrito,
        latitud: Number(ie.latitud),
        longitud: Number(ie.longitud),
        estado: acc ? clasificarSemaforo(acc.suma / acc.n) : 'sinRegistro',
      };
    });

    // 4b. Cobertura por distrito (todas las IEs activas, cuántas monitoreadas).
    const [iesActivas, iesMonitoreadas] = await Promise.all([
      this.prisma.institucionEducativa.findMany({
        where: institucionWhere,
        select: { id: true, distrito: true },
      }),
      this.prisma.institucionEducativa.findMany({
        where: {
          ...institucionWhere,
          cronogramas: {
            some: { estado: 'COMPLETADO', fechaProgramada: { gte: inicioAnio, lte: finAnio } },
          },
        },
        select: { id: true },
      }),
    ]);
    const monitoreadaIds = new Set(iesMonitoreadas.map((ie) => ie.id));
    const distritoMap = new Map<string, { total: number; monitoreadas: number }>();
    for (const ie of iesActivas) {
      const acc = distritoMap.get(ie.distrito) ?? { total: 0, monitoreadas: 0 };
      acc.total += 1;
      if (monitoreadaIds.has(ie.id)) acc.monitoreadas += 1;
      distritoMap.set(ie.distrito, acc);
    }
    const coberturaPorDistrito: IUgelDashboardDistrito[] = [...distritoMap.entries()]
      .map(([distrito, { total, monitoreadas: m }]) => ({
        distrito,
        totalInstituciones: total,
        monitoreadas: m,
        porcentajeCobertura: total > 0 ? Math.round((m / total) * 100) : 0,
      }))
      .sort((a, b) => a.porcentajeCobertura - b.porcentajeCobertura);

    // 4c. Cobertura del año anterior (para la tendencia del héroe).
    const monitoreadasAnioPrevio = await this.prisma.institucionEducativa.count({
      where: {
        ...institucionWhere,
        cronogramas: {
          some: {
            estado: 'COMPLETADO',
            fechaProgramada: {
              gte: new Date(Date.UTC(anio - 1, 0, 1)),
              lte: new Date(Date.UTC(anio - 1, 11, 31, 23, 59, 59)),
            },
          },
        },
      },
    });
    const coberturaAnioPrevio =
      totalInstituciones > 0
        ? Math.round((monitoreadasAnioPrevio / totalInstituciones) * 100)
        : 0;

    // 5. Monitoreos recientes (top N por fecha de finalización).
    const monitoreosRecientes: IUgelDashboardMonitoreoReciente[] = fichas
      .slice(0, RECIENTES_LIMIT)
      .map((ficha) => {
        const ie = ficha.cronograma.institucion;
        const monitor = ficha.cronograma.monitor.persona;
        return {
          fichaId: ficha.id,
          institucionNombre: ie.nombre,
          institucionCodigoModular: ie.codigoModular,
          nivelEducativo: ficha.cronograma.nivelEducativo,
          distrito: ie.distrito,
          especialistaNombre: `${monitor.nombres} ${monitor.apellidos}`.trim(),
          fecha: (ficha.finalizadaAt ?? ficha.createdAt).toISOString(),
          nivelLogro: ficha.nivelLogro as NivelLogro,
          promedio: Number(ficha.promedio),
        };
      });

    return {
      anio,
      kpis: {
        totalInstituciones,
        monitoreadas,
        pendientes,
        nivelPromedio,
        porcentajeCobertura,
      },
      semaforo: { critico, enProceso, logroPrevisto, sinRegistro },
      requierenAtencion,
      coberturaPorDistrito,
      institucionesMapa,
      coberturaAnioPrevio,
      monitoreosRecientes,
    };
  }
}
