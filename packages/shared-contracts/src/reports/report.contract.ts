import type { EstadoFicha, NivelLogro } from '../evaluations/ficha.contract.js';
import type { TipoMonitoreo } from '../scheduling/visit.contract.js';

export interface IReporteFicha {
  id: string;
  cronogramaId: string;
  plantillaId?: string;
  plantillaNombre?: string;
  institucionId: string;
  institucionNombre: string;
  institucionCodigoModular: string;
  evaluadoId: string;
  evaluadoNombre: string;
  evaluadoDni?: string;
  evaluadoTelefono?: string;
  especialistaId: string;
  especialistaNombre: string;
  tipoMonitoreo: TipoMonitoreo;
  anioAcademico: number;
  nivelLogro: NivelLogro;
  promedio: number;
  puntajeTotal: number;
  estado: EstadoFicha;
  observaciones?: string | null;
  compromisos?: string | null;
  sugerencias?: string | null;
  correoEnviado?: boolean;
  fechaEjecucion: string;
  fechaProgramada?: string;
  horaInicio?: string;
  horaFin?: string;
  modalidad: string;
  nivel: string;
  respuestas?: {
    nombre: string;
    orden?: number;
    nivel: number;
    observaciones?: string | null;
  }[];
  firmas?: {
    rolFirmante: string;
    firmanteNombre: string;
    imagenUrl: string;
    fechaFirma: string;
  }[];
}

export interface IReporteResumenIE {
  institucionId: string;
  institucionNombre: string;
  institucionCodigoModular: string;
  totalFichas: number;
  totalDocentes: number;
  totalDirectivos: number;
  promedioInstitucional: number;
  distribucionNivelLogro: Record<NivelLogro, number>;
  porcentajeSatisfaccion: number;
}

export interface IQueryReportesFichas {
  anioAcademico?: number;
  institucionId?: string;
  tipoMonitoreo?: TipoMonitoreo;
  nivelLogro?: NivelLogro;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface IPaginatedReportesFichas {
  data: IReporteFicha[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAnalisisDesempenoCriterio {
  desempenoId: string;
  nombre: string;
  orden: number;
  descripcionCorta: string | null;
  totalEvaluados: number;
  conteoNivelI: number;
  conteoNivelII: number;
  conteoNivelIII: number;
  conteoNivelIV: number;
  porcentajeNivelI: number;
  porcentajeNivelII: number;
  porcentajeNivelIII: number;
  porcentajeNivelIV: number;
  promedio: number;
  tasaLogro: number;
  tasaRefuerzo: number;
}
