import { createContext } from 'react';
import type { Cronograma } from './model';
import type { SolicitudReprogramacion } from '@entities/model-reprogramaciones';

export interface CronogramaContextType {
  cronogramas: Cronograma[];
  setCronogramas: React.Dispatch<React.SetStateAction<Cronograma[]>>;
  reprogramaciones: Record<string, SolicitudReprogramacion>;
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
