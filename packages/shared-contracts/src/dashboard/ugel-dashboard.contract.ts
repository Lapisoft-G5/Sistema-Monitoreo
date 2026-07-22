import type { NivelLogro } from '../evaluations/ficha.contract.js';

/**
 * Contrato del Dashboard del Director UGEL (vista provincial).
 *
 * Agrega, a nivel de toda la UGEL (o del scope del rol que consulte):
 *   - KPIs institucionales (total de II.EE., monitoreadas, pendientes, nivel promedio).
 *   - Semáforo institucional (II.EE. clasificadas por su promedio institucional).
 *   - Monitoreos recientes (últimas fichas finalizadas de la provincia).
 *
 * El mapa georreferencial se incorpora en una fase posterior, cuando las
 * II.EE. tengan coordenadas (latitud/longitud) en el modelo.
 */

export interface IUgelDashboardKpis {
  /** Total de II.EE. activas en el scope. */
  totalInstituciones: number;
  /** II.EE. con al menos un monitoreo COMPLETADO en el año. */
  monitoreadas: number;
  /** II.EE. sin monitoreo completado en el año. */
  pendientes: number;
  /** Promedio provincial de la rúbrica (0.00 a 4.00). */
  nivelPromedio: number;
  /** Porcentaje de cobertura de monitoreo (monitoreadas / total * 100). */
  porcentajeCobertura: number;
}

export interface IUgelDashboardSemaforo {
  /** II.EE. con promedio institucional en INICIO (crítico / rojo). */
  critico: number;
  /** II.EE. en EN_PROCESO (en seguimiento / naranja). */
  enProceso: number;
  /** II.EE. en LOGRO_ESPERADO o LOGRO_DESTACADO (logro previsto / verde). */
  logroPrevisto: number;
  /** II.EE. sin ficha finalizada (sin registro). */
  sinRegistro: number;
}

export interface IUgelDashboardMonitoreoReciente {
  fichaId: string;
  institucionNombre: string;
  institucionCodigoModular: string;
  nivelEducativo: string;
  distrito: string;
  especialistaNombre: string;
  /** Fecha de finalización de la ficha (ISO 8601). */
  fecha: string;
  nivelLogro: NivelLogro;
  promedio: number;
}

/** Docente/directivo con desempeño crítico (última ficha en INICIO). */
export interface IDocenteCritico {
  docenteId: string;
  nombre: string;
  /** 'Docente' | 'Directivo' (según el tipo de monitoreo). */
  cargo: string;
  /**
   * Especialidad(es) del docente (ej. "CTA", "Matematica"), separadas por coma.
   * Null si el docente no tiene especialidad registrada (ej. muchos directivos).
   */
  especialidad: string | null;
  promedio: number;
  nivelLogro: NivelLogro;
  /** Cantidad de monitoreos finalizados que recibió el docente en el año. */
  monitoreosCompletados: number;
}

/**
 * IE con docentes/directivos que requieren atención (versión detallada por
 * institución), usada por el módulo "Focos de Atención" (Jefe de Gestión, Jefe
 * de Área y Especialistas).
 */
export interface IUgelDashboardCriticaIe {
  institucionId: string;
  nombre: string;
  distrito: string;
  nivelEducativo: string;
  docentes: IDocenteCritico[];
}

/** IE crítica (promedio institucional en INICIO) dentro de un distrito. */
export interface IUgelDashboardIeCriticaDistrito {
  institucionId: string;
  nombre: string;
  nivelEducativo: string;
  promedio: number;
}

/**
 * Distrito con promedio institucional crítico (INICIO), para "Requieren atención".
 * El foco pasa de la IE individual al distrito: se notifica al Jefe de Gestión
 * sobre los distritos con menor desempeño, con el desglose de sus II.EE. críticas.
 */
export interface IUgelDashboardDistritoCritico {
  distrito: string;
  /** Promedio del distrito (media de los promedios institucionales monitoreados). */
  promedio: number;
  /** II.EE. del distrito con monitoreo (para el denominador del promedio). */
  totalInstituciones: number;
  /** II.EE. del distrito en nivel crítico, para el desglose expandible. */
  institucionesCriticas: IUgelDashboardIeCriticaDistrito[];
}

/** Cobertura de monitoreo agregada por distrito. */
export interface IUgelDashboardDistrito {
  distrito: string;
  totalInstituciones: number;
  monitoreadas: number;
  porcentajeCobertura: number;
}

/** Detalle de una IE, mostrado al hacer clic en su punto del mapa. */
export interface IUgelDashboardInstitucionDetalle {
  institucionId: string;
  nombre: string;
  codigoModular: string;
  distrito: string;
  nivelEducativo: string;
  /** Nombre del director de la IE, o null si no tiene director registrado. */
  director: string | null;
  /** Total de docentes activos de la IE. */
  totalDocentes: number;
  /** Monitoreos completados en el año. */
  monitoreosRealizados: number;
  /** Monitoreos programados en el año (total del cronograma). */
  monitoreosProgramados: number;
  /** Cobertura = realizados / programados * 100. */
  porcentajeCobertura: number;
}

export type EstadoSemaforoIe = 'critico' | 'enProceso' | 'logroPrevisto' | 'sinRegistro';

/** IE geolocalizada para el mapa (marcador por su estado de monitoreo). */
export interface IUgelDashboardIeMapa {
  institucionId: string;
  nombre: string;
  distrito: string;
  nivelEducativo: string;
  latitud: number;
  longitud: number;
  estado: EstadoSemaforoIe;
}

export interface IUgelDashboardResponse {
  anio: number;
  kpis: IUgelDashboardKpis;
  semaforo: IUgelDashboardSemaforo;
  /** Distritos con promedio crítico, ordenados por menor promedio (Director UGEL). */
  distritosCriticos: IUgelDashboardDistritoCritico[];
  /** II.EE. críticas con sus docentes/directivos en INICIO (módulo Focos de Atención). */
  requierenAtencion: IUgelDashboardCriticaIe[];
  /** Ranking de cobertura por distrito. */
  coberturaPorDistrito: IUgelDashboardDistrito[];
  /** II.EE. geolocalizadas para el mapa (marcadores). */
  institucionesMapa: IUgelDashboardIeMapa[];
  /** % de cobertura del año anterior (para la tendencia del héroe); 0 si no hay datos. */
  coberturaAnioPrevio: number;
  monitoreosRecientes: IUgelDashboardMonitoreoReciente[];
}
