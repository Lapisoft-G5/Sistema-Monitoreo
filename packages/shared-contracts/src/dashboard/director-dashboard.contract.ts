import type { NivelLogro } from '../evaluations/ficha.contract.js';

/**
 * Contrato del Dashboard del Director de Institución.
 *
 * Agrega, para la IE del director autenticado:
 *   - KPIs de monitoreo (docentes monitoreados / pendientes / nivel promedio).
 *   - Semáforo institucional (distribución de docentes por nivel de logro).
 *   - Monitoreos recientes (últimas fichas finalizadas de la IE).
 *
 * El mapa (ubicación geográfica) se incorpora en una fase posterior, cuando
 * las II.EE. tengan coordenadas (latitud/longitud) en el modelo.
 */

export interface IDirectorDashboardInstitucion {
  id: string;
  nombre: string;
  codigoModular: string;
  nivelEducativo: string;
  distrito: string;
}

export interface IDirectorDashboardKpis {
  /** Total de docentes registrados en la IE. */
  totalDocentes: number;
  /** Docentes con al menos una ficha finalizada (monitoreados). */
  monitoreados: number;
  /** Docentes sin ficha finalizada (pendientes). */
  pendientes: number;
  /** Promedio institucional de la rúbrica (0.00 a 4.00). */
  nivelPromedio: number;
  /** Porcentaje de cobertura de monitoreo (monitoreados / totalDocentes * 100). */
  porcentajeCobertura: number;
}

export interface IDirectorDashboardSemaforo {
  /** Docentes en INICIO (situación crítica / rojo). */
  critico: number;
  /** Docentes en EN_PROCESO (en seguimiento / naranja). */
  enProceso: number;
  /** Docentes en LOGRO_ESPERADO o LOGRO_DESTACADO (logro previsto / verde). */
  logroPrevisto: number;
  /** Docentes sin ficha finalizada (sin registro). */
  sinRegistro: number;
}

export interface IDirectorDashboardMonitoreoReciente {
  fichaId: string;
  docenteNombre: string;
  especialistaNombre: string;
  nivelEducativo: string;
  /** Fecha de finalización de la ficha (ISO 8601). */
  fecha: string;
  nivelLogro: NivelLogro;
  promedio: number;
}

export interface IDirectorDashboardResponse {
  institucion: IDirectorDashboardInstitucion | null;
  kpis: IDirectorDashboardKpis;
  semaforo: IDirectorDashboardSemaforo;
  monitoreosRecientes: IDirectorDashboardMonitoreoReciente[];
}
