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

/** IE que requiere atención (promedio institucional en banda crítica). */
export interface IUgelDashboardCriticaIe {
  institucionId: string;
  nombre: string;
  distrito: string;
  nivelEducativo: string;
  promedio: number;
  nivelLogro: NivelLogro;
}

/** Cobertura de monitoreo agregada por distrito. */
export interface IUgelDashboardDistrito {
  distrito: string;
  totalInstituciones: number;
  monitoreadas: number;
  porcentajeCobertura: number;
}

export interface IUgelDashboardResponse {
  anio: number;
  kpis: IUgelDashboardKpis;
  semaforo: IUgelDashboardSemaforo;
  /** II.EE. críticas ordenadas por menor promedio (para "Requieren atención"). */
  requierenAtencion: IUgelDashboardCriticaIe[];
  /** Ranking de cobertura por distrito. */
  coberturaPorDistrito: IUgelDashboardDistrito[];
  /** % de cobertura del año anterior (para la tendencia del héroe); 0 si no hay datos. */
  coberturaAnioPrevio: number;
  monitoreosRecientes: IUgelDashboardMonitoreoReciente[];
}
