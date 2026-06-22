import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Cronograma } from './model';
import type { SolicitudReprogramacion } from '@entities/model-reprogramaciones';
import { CronogramaContext, type EspecialistaLite, type InstitucionLite } from './cronograma-context';
import { cronogramasApi } from './api/cronogramas.api.js';
import type { ICreateVisitaRequest, IUpdateVisitaRequest } from '@sistema-monitoreo/shared-contracts';
import { institutionsApi } from '@shared/api/institutions.api';
import { especialistasApi } from '@shared/api/especialistas.api';
import { teachersApi } from '@shared/api/teachers.api';
import { mapApiDocenteToFrontend } from '@features/docentes/docente-service';
import type { Docente } from '@entities/model-docentes';
import { useUser } from '@entities/model-user';

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const CronogramaProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUser();
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [reprogramaciones, setReprogramaciones] = useState<Record<string, SolicitudReprogramacion>>({});
  const [especialistas, setEspecialistas] = useState<EspecialistaLite[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionLite[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [espRes, instRes, docRes, cronoRes, solRes] = await Promise.all([
        especialistasApi.findAll(),
        institutionsApi.findAll({ limit: 1000 }),
        teachersApi.findAll(),
        cronogramasApi.findAll(),
        cronogramasApi.findAllSolicitudes()
      ]);

      let loadedEsp: EspecialistaLite[] = [];
      let loadedInst: InstitucionLite[] = [];
      let loadedDoc: Docente[] = [];

      if (espRes.ok && espRes.data) {
        loadedEsp = espRes.data.map(e => ({
          id: e.id,
          nombre: `${e.persona.nombres} ${e.persona.apellidos}`,
          initials: getInitials(`${e.persona.nombres} ${e.persona.apellidos}`),
          modalidad: e.modalidad || 'EBR',
          nivelEducativo: e.nivelEducativo || 'Primaria',
          cargo: e.cargo || 'Especialista',
          especialidades: e.especialidades || [],
        }));
        setEspecialistas(loadedEsp);
      } else {
        setEspecialistas([]);
      }
      if (instRes.ok && instRes.data) {
        loadedInst = instRes.data.data.map(i => ({
          id: i.id,
          nombre: i.nombre,
          modalidad: i.modalidad || 'EBR',
          nivelEducativo: i.nivelEducativo
        }));
        setInstituciones(loadedInst);
      } else {
        setInstituciones([]);
      }
      if (docRes.ok && docRes.data) {
        loadedDoc = docRes.data.map(d => mapApiDocenteToFrontend(d));
        setDocentes(loadedDoc);
      } else {
        setDocentes([]);
      }
      if (cronoRes) {
        const mappedCrono = cronoRes.map(c => {
          const esp = loadedEsp.find(e => e.id === c.monitorId);
          const inst = loadedInst.find(i => i.id === c.institucionId);
          const doc = loadedDoc.find(d => d.id === c.evaluadoId);
          return {
            id: c.id,
            fechaHora: `${String(c.fechaProgramada).split('T')[0]}T${c.horaInicio}`,
            especialista: esp ? esp.nombre : 'Sin Asignar',
            especialistaInitials: esp ? esp.initials : 'SA',
            institucion: inst ? inst.nombre : 'Sin I.E.',
            docenteDirectivo: doc ? `${doc.nombres} ${doc.apellidos}` : 'Sin Docente',
            tipo: c.tipoMonitoreo as 'DOCENTE' | 'DIRECTIVO',
            nroVisita: String(c.numeroVisita).padStart(2, '0'),
            estado: c.estado as 'PROGRAMADO' | 'EN PROCESO' | 'COMPLETADO' | 'REPROGRAMADO' | 'CANCELADO',
            fechaEjecutada: undefined,
            modalidad: c.modalidad,
            nivel: c.nivelEducativo,
            observaciones: c.detalles ?? undefined,
            especialistaCargo: esp ? esp.cargo : 'Especialista',
            monitorId: c.monitorId,
            evaluadoId: c.evaluadoId,
            institucionId: c.institucionId,
            monitorEspecialidades: esp?.especialidades,
          };
        });
        setCronogramas(mappedCrono);
      } else {
        setCronogramas([]);
      }
      if (solRes) {
        const solMap: Record<string, SolicitudReprogramacion> = {};
        solRes.forEach(s => {
          solMap[s.cronogramaId] = {
            id: s.id,
            fechaOriginal: `${s.fechaOriginal}T${s.horaOriginal}`,
            fechaNueva: `${s.fechaPropuesta}T${s.horaPropuesta}`,
            motivo: s.justificacion,
            archivoNombre: s.archivoSustentoUrl && s.archivoSustentoUrl !== '' ? (s.archivoSustentoUrl.split('/').pop() || 'oficio.pdf') : '',
            estado: s.estado as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
            fechaRegistro: s.createdAt,
            aprobador: s.resueltoPorId || undefined,
            aprobadorComentario: s.comentarioResolucion || undefined,
            fechaAprobacion: s.fechaResolucion || undefined
          };
        });
        setReprogramaciones(solMap);
      } else {
        setReprogramaciones({});
      }
    } catch (err) {
      console.error('Error fetching data for CronogramaProvider', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      const t = setTimeout(() => {
        setCronogramas([]);
        setReprogramaciones({});
        setEspecialistas([]);
        setInstituciones([]);
        setDocentes([]);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(t);
  }, [isAuthenticated, fetchData]);

  const loadReprogramaciones = useCallback(() => {
    if (!isAuthenticated) return;
    cronogramasApi.findAllSolicitudes()
      .then(solRes => {
        const solMap: Record<string, SolicitudReprogramacion> = {};
        solRes.forEach(s => {
          solMap[s.cronogramaId] = {
            id: s.id,
            fechaOriginal: `${s.fechaOriginal}T${s.horaOriginal}`,
            fechaNueva: `${s.fechaPropuesta}T${s.horaPropuesta}`,
            motivo: s.justificacion,
            archivoNombre: s.archivoSustentoUrl && s.archivoSustentoUrl !== '' ? (s.archivoSustentoUrl.split('/').pop() || 'oficio.pdf') : '',
            estado: s.estado as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
            fechaRegistro: s.createdAt,
            aprobador: s.resueltoPorId || undefined,
            aprobadorComentario: s.comentarioResolucion || undefined,
            fechaAprobacion: s.fechaResolucion || undefined
          };
        });
        setReprogramaciones(solMap);
      })
      .catch(err => console.error(err));
  }, [isAuthenticated]);

  const createCronograma = useCallback(async (payload: ICreateVisitaRequest) => {
    await cronogramasApi.create(payload);
    await fetchData();
  }, [fetchData]);

  const updateCronograma = useCallback(async (id: string, payload: IUpdateVisitaRequest) => {
    await cronogramasApi.update(id, payload);
    await fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  const submitRescheduleRequest = useCallback((
    visitId: string,
    request: {
      fechaOriginal: string;
      fechaNueva: string;
      motivo: string;
      archivoNombre?: string;
      archivoBase64?: string;
    }
  ) => {
    const [datePart, timePart] = request.fechaNueva.split('T');
    const formattedTime = timePart ? (timePart + ':00').slice(0, 8) : '00:00:00';
    cronogramasApi
      .crearSolicitud({
        cronogramaId: visitId,
        fechaPropuesta: datePart,
        horaPropuesta: formattedTime,
        justificacion: request.motivo,
        archivoSustentoNombre: request.archivoNombre,
        archivoSustentoBase64: request.archivoBase64,
      })
      .then(() => loadReprogramaciones())
      .catch((err: unknown) => console.warn('[cronograma] No se pudo crear solicitud en backend:', err));
  }, [loadReprogramaciones]);

  const approveRescheduleRequest = useCallback((
    visitId: string,
    _aprobador: string,
    comentario: string
  ) => {
    cronogramasApi
      .findAllSolicitudes({ cronogramaId: visitId, estado: 'PENDIENTE' })
      .then((solicitudes) => {
        const solicitud = solicitudes[0];
        if (solicitud) {
          return cronogramasApi.aprobarSolicitud(solicitud.id, comentario || 'Aprobado');
        }
      })
      .then(() => {
        loadReprogramaciones();
        fetchData();
      })
      .catch((err: unknown) => console.warn('[cronograma] No se pudo aprobar solicitud en backend:', err));
  }, [loadReprogramaciones, fetchData]);

  const rejectRescheduleRequest = useCallback((
    visitId: string,
    _aprobador: string,
    comentario: string
  ) => {
    cronogramasApi
      .findAllSolicitudes({ cronogramaId: visitId, estado: 'PENDIENTE' })
      .then((solicitudes) => {
        const solicitud = solicitudes[0];
        if (solicitud) {
          return cronogramasApi.rechazarSolicitud(solicitud.id, comentario || 'Rechazado');
        }
      })
      .then(() => loadReprogramaciones())
      .catch((err: unknown) => console.warn('[cronograma] No se pudo rechazar solicitud en backend:', err));
  }, [loadReprogramaciones]);

  const deleteCronograma = useCallback((id: string) => {
    cronogramasApi.remove(id)
      .then(() => fetchData())
      .catch(console.error);
  }, [fetchData]);

  return (
    <CronogramaContext.Provider
      value={{
        cronogramas,
        setCronogramas,
        reprogramaciones,
        especialistas,
        instituciones,
        docentes,
        isLoading,
        createCronograma,
        updateCronograma,
        refetch,
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
