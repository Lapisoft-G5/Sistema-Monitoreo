import type { Prisma } from '../../../generated/prisma/client.js';
import type {
  IVisita,
  ISolicitudReprogramacion,
  EstadoVisita,
  EstadoSolicitudReprogramacion,
  TipoMonitoreo,
  Modalidad,
} from '@sistema-monitoreo/shared-contracts';

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

type VisitaPayload = Prisma.CronogramaGetPayload<Record<string, never>>;

export function fromPrismaVisita(v: VisitaPayload): IVisita {
  return {
    id: v.id,
    monitorId: v.monitorId,
    institucionId: v.institucionId,
    evaluadoId: v.evaluadoId,
    planId: v.planId,
    tipoMonitoreo: v.tipoMonitoreo as TipoMonitoreo,
    numeroVisita: v.numeroVisita,
    fechaProgramada: toDateOnly(v.fechaProgramada),
    horaInicio: v.horaInicio,
    detalles: v.detalles,
    estado: v.estado as EstadoVisita,
    modalidad: v.modalidad as Modalidad,
    nivelEducativo: v.nivelEducativo,
    creadoPorId: v.creadoPorId,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

type SolicitudPayload = Prisma.SolicitudReprogramacionGetPayload<{
  include: {
    resueltoPor: {
      include: {
        persona: true;
        rol: true;
      };
    };
  };
}>;

export function fromPrismaSolicitud(s: SolicitudPayload): ISolicitudReprogramacion {
  const aprobadorNombre = s.resueltoPor?.persona
    ? `${s.resueltoPor.persona.nombres} ${s.resueltoPor.persona.apellidos}`
    : null;
  const aprobadorRol = s.resueltoPor?.rol?.nombre || null;

  return {
    id: s.id,
    cronogramaId: s.cronogramaId,
    solicitanteId: s.solicitanteId,
    solicitanteRolAlCrear: s.solicitanteRolAlCrear,
    fechaOriginal: toDateOnly(s.fechaOriginal),
    horaOriginal: s.horaOriginal,
    fechaPropuesta: toDateOnly(s.fechaPropuesta),
    horaPropuesta: s.horaPropuesta,
    justificacion: s.justificacion,
    archivoSustentoUrl: s.archivoSustentoUrl,
    estado: s.estado as EstadoSolicitudReprogramacion,
    resueltoPorId: s.resueltoPorId,
    resueltoPorNombre: aprobadorNombre,
    resueltoPorRol: aprobadorRol,
    comentarioResolucion: s.comentarioResolucion,
    fechaResolucion: s.fechaResolucion ? s.fechaResolucion.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}
