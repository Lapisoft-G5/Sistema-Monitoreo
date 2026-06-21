import { createContext } from 'react';
import type { Cronograma } from './model';
import type { SolicitudReprogramacion } from '@entities/model-reprogramaciones';
import type { Docente } from '@entities/model-docentes';
import type { ICreateVisitaRequest, IUpdateVisitaRequest } from '@sistema-monitoreo/shared-contracts';

export interface EspecialistaLite {
  id: string;
  nombre: string;
  initials: string;
  modalidad: string;
  nivelEducativo: string;
  cargo: string;
}

export interface InstitucionLite {
  id: string;
  nombre: string;
  modalidad: string;
  nivelEducativo: string;
}

export interface CronogramaContextType {
  cronogramas: Cronograma[];
  setCronogramas: React.Dispatch<React.SetStateAction<Cronograma[]>>;
  reprogramaciones: Record<string, SolicitudReprogramacion>;
  especialistas: EspecialistaLite[];
  instituciones: InstitucionLite[];
  docentes: Docente[];
  isLoading: boolean;
  createCronograma: (payload: ICreateVisitaRequest) => Promise<void>;
  updateCronograma: (id: string, payload: IUpdateVisitaRequest) => Promise<void>;
  refetch: () => Promise<void>;
  submitRescheduleRequest: (
    visitId: string,
    request: {
      fechaOriginal: string;
      fechaNueva: string;
      motivo: string;
      archivoNombre?: string;
      archivoBase64?: string;
    }
  ) => void;
  approveRescheduleRequest: (
    visitId: string,
    aprobador: string,
    comentario: string
  ) => void;
  rejectRescheduleRequest: (
    visitId: string,
    aprobador: string,
    comentario: string
  ) => void;
  deleteCronograma: (id: string) => void;
}

export const CronogramaContext = createContext<CronogramaContextType | null>(null);

