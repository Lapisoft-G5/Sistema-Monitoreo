import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Cronograma } from './model';
import type { SolicitudReprogramacion } from '@entities/model-reprogramaciones';
import { MOCK_CRONOGRAMAS } from './mocks';
import { CronogramaContext } from './cronograma-context';

export const CronogramaProvider = ({ children }: { children: ReactNode }) => {
  // 1. Estado de Cronogramas
  const [cronogramas, setCronogramas] = useState<Cronograma[]>(() => {
    const saved = localStorage.getItem('sistema-monitoreo:cronogramas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_CRONOGRAMAS;
      }
    }
    return MOCK_CRONOGRAMAS;
  });

  // Sincronizar cronogramas con localStorage
  useEffect(() => {
    localStorage.setItem('sistema-monitoreo:cronogramas', JSON.stringify(cronogramas));
  }, [cronogramas]);

  // 2. Estado de Reprogramaciones
  const [reprogramaciones, setReprogramaciones] = useState<Record<string, SolicitudReprogramacion>>({});

  // Carga de solicitudes de reprogramación asociadas
  const loadReprogramaciones = useCallback(() => {
    const nextReprog: Record<string, SolicitudReprogramacion> = {};
    
    // Semilla para la visita ID 13 (mock obligatorio)
    const key13 = 'sistema-monitoreo:reprogramar-state:13';
    if (!localStorage.getItem(key13)) {
      const mockRequest: SolicitudReprogramacion = {
        id: 'REQ-2023-089',
        fechaOriginal: '2023-10-15T08:30',
        fechaNueva: '2023-10-12T08:30',
        motivo: 'El director de la I.E. 70005 - Lampa Central me ha informado formalmente (Oficio Nº 045-2023-DIR) que el día 15 de Octubre el plantel participará en el desfile cívico distrital obligatorio, por lo que no habrá atención administrativa regular. Solicito reprogramación para el día 12.',
        archivoNombre: 'Oficio_045_2023_DIR_LampaCentral.pdf',
        estado: 'APROBADO',
        fechaRegistro: '2023-10-11',
        aprobador: 'Carlos Mendoza',
        aprobadorComentario: 'Se verifica cruce de horarios justificado por evento cívico distrital. Proceder con el cambio de fecha propuesto.',
        fechaAprobacion: '2023-10-12 14:30'
      };
      localStorage.setItem(key13, JSON.stringify(mockRequest));
    }

    cronogramas.forEach((visit) => {
      const saved = localStorage.getItem(`sistema-monitoreo:reprogramar-state:${visit.id}`);
      if (saved) {
        try {
          nextReprog[visit.id] = JSON.parse(saved);
        } catch {}
      }
    });

    setReprogramaciones(nextReprog);
  }, [cronogramas]);

  useEffect(() => {
    loadReprogramaciones();
  }, [cronogramas, loadReprogramaciones]);

  // Acciones
  const submitRescheduleRequest = useCallback((
    visitId: string,
    request: {
      fechaOriginal: string;
      fechaNueva: string;
      motivo: string;
      archivoNombre: string;
    }
  ) => {
    const newRequest: SolicitudReprogramacion = {
      id: 'REQ-2023-' + Math.floor(Math.random() * 900 + 100),
      fechaOriginal: request.fechaOriginal,
      fechaNueva: request.fechaNueva,
      motivo: request.motivo,
      archivoNombre: request.archivoNombre || 'Oficio_Sustentatorio.pdf',
      estado: 'PENDIENTE',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(`sistema-monitoreo:reprogramar-state:${visitId}`, JSON.stringify(newRequest));
    loadReprogramaciones();
  }, [loadReprogramaciones]);

  const approveRescheduleRequest = useCallback((
    visitId: string,
    aprobador: string,
    comentario: string
  ) => {
    const activeReq = reprogramaciones[visitId];
    if (!activeReq) return;

    const approvedRequest: SolicitudReprogramacion = {
      ...activeReq,
      estado: 'APROBADO',
      aprobador: aprobador || 'Carlos Mendoza',
      aprobadorComentario: comentario || 'Se verifica cruce de horarios justificado por evento cívico distrital. Proceder con el cambio de fecha propuesto.',
      fechaAprobacion: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    localStorage.setItem(`sistema-monitoreo:reprogramar-state:${visitId}`, JSON.stringify(approvedRequest));
    
    // Al aprobar, mutamos el cronograma
    setCronogramas((prev) =>
      prev.map((c) => {
        if (c.id === visitId) {
          return {
            ...c,
            fechaHora: activeReq.fechaNueva,
            estado: 'REPROGRAMADO'
          };
        }
        return c;
      })
    );
  }, [reprogramaciones]);

  const rejectRescheduleRequest = useCallback((
    visitId: string,
    aprobador: string,
    comentario: string
  ) => {
    const activeReq = reprogramaciones[visitId];
    if (!activeReq) return;

    const rejectedRequest: SolicitudReprogramacion = {
      ...activeReq,
      estado: 'RECHAZADO',
      aprobador: aprobador || 'Carlos Mendoza',
      aprobadorComentario: comentario || 'Solicitud de cambio de fecha rechazada por no cumplir con la anticipación debida o falta de justificación formal.',
      fechaAprobacion: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    localStorage.setItem(`sistema-monitoreo:reprogramar-state:${visitId}`, JSON.stringify(rejectedRequest));
    loadReprogramaciones();
  }, [reprogramaciones, loadReprogramaciones]);

  const deleteCronograma = useCallback((id: string) => {
    setCronogramas((prev) => prev.filter((c) => c.id !== id));
    localStorage.removeItem(`sistema-monitoreo:reprogramar-state:${id}`);
  }, []);

  return (
    <CronogramaContext.Provider
      value={{
        cronogramas,
        setCronogramas,
        reprogramaciones,
        submitRescheduleRequest,
        approveRescheduleRequest,
        rejectRescheduleRequest,
        deleteCronograma
      }}
    >
      {children}
    </CronogramaContext.Provider>
  );
};
