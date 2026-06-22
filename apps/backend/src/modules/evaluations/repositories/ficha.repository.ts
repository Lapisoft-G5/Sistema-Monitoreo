/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  IFichaMonitoreo,
  IFichaContexto,
  IFichaRespuestaDesempeno,
  IFichaRespuestaAspecto,
  IFichaRespuestaEjeItem,
  NivelLogro,
  EstadoFicha,
} from '@sistema-monitoreo/shared-contracts';

export interface CreateFichaData {
  cronogramaId: string;
  plantillaId: string;
  anioAcademico: number;
  contexto: Omit<IFichaContexto, 'id'>;
  creadoPorId: string;
}

export interface SaveRespuestaData {
  fichaId: string;
  desempenoId: string;
  nivel: number;
  observaciones?: string;
}

export interface SaveRespuestaEjeItemData {
  fichaId: string;
  ejeItemId: string;
  nivel: number;
  evidenciaUrl?: string | null;
}

export interface SaveRespuestaAspectoData {
  fichaId: string;
  aspectoId: string;
  marcado: boolean;
}

export interface FinalizarFichaData {
  fichaId: string;
  finalizadoPorId: string;
  observaciones?: string;
  sugerencias?: string;
  compromisos?: string;
}

export abstract class FichaRepository {
  abstract findByVisitaId(cronogramaId: string): Promise<IFichaMonitoreo | null>;
  abstract findById(id: string): Promise<IFichaMonitoreo | null>;
  abstract create(data: CreateFichaData): Promise<IFichaMonitoreo>;
  abstract saveRespuestaDesempeno(data: SaveRespuestaData): Promise<IFichaRespuestaDesempeno>;
  abstract saveRespuestaAspecto(data: SaveRespuestaAspectoData): Promise<IFichaRespuestaAspecto>;
  abstract saveRespuestaEjeItem(data: SaveRespuestaEjeItemData): Promise<IFichaRespuestaEjeItem>;
  abstract finalizar(
    fichaId: string,
    puntajeTotal: number,
    promedio: number,
    nivelLogro: NivelLogro,
    finalizadaPorId: string,
    observaciones?: string,
    sugerencias?: string,
    compromisos?: string,
  ): Promise<IFichaMonitoreo>;
  abstract plantillaEstaHistorica(plantillaId: string): Promise<boolean>;
}
