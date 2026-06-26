import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ISolicitudReprogramacion } from '@sistema-monitoreo/shared-contracts';
import type { StorageService } from '../../../shared/storage/storage.constants.js';
import type {
  CronogramaRepository,
  SolicitudReprogramacionRepository,
  CreateSolicitudData,
  ResolverSolicitudData,
} from '../repositories/cronograma.repository.js';
import type {
  CreateSolicitudReprogramacionDto,
  ResolverSolicitudDto,
} from '../dto/solicitud-reprogramacion.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { ScopeFilter } from '../../../shared/auth/scope-filter.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

export async function findAllSolicitudes(
  solicitudRepo: SolicitudReprogramacionRepository,
  filters?: any,
): Promise<ISolicitudReprogramacion[]> {
  return solicitudRepo.findAll(filters);
}

export async function findSolicitudById(
  solicitudRepo: SolicitudReprogramacionRepository,
  id: string,
): Promise<ISolicitudReprogramacion> {
  const s = await solicitudRepo.findById(id);
  if (!s) throw new NotFoundException(`Solicitud ${id} no encontrada.`);
  return s;
}

export async function crearSolicitud(
  cronogramaRepo: CronogramaRepository,
  solicitudRepo: SolicitudReprogramacionRepository,
  storage: StorageService,
  dto: CreateSolicitudReprogramacionDto,
  session: SessionUser,
): Promise<ISolicitudReprogramacion> {
  const cronograma = await cronogramaRepo.findById(dto.cronogramaId);
  if (!cronograma) throw new NotFoundException(`Visita ${dto.cronogramaId} no encontrada.`);

  const pendiente = await solicitudRepo.findPendienteByCronograma(dto.cronogramaId);
  if (pendiente) {
    throw new BadRequestException(
      `Ya existe una solicitud PENDIENTE para esta visita. Id: ${pendiente.id}.`,
    );
  }

  let archivoSustentoUrl = '';
  if (dto.archivoSustentoBase64) {
    const buffer = Buffer.from(dto.archivoSustentoBase64, 'base64');
    const stored = await storage.savePdf(
      'reprogramaciones',
      dto.archivoSustentoNombre ?? 'oficio.pdf',
      buffer,
    );
    archivoSustentoUrl = stored.url;
  }

  const data: CreateSolicitudData = {
    cronogramaId: dto.cronogramaId,
    solicitanteId: session.id,
    solicitanteRolAlCrear: session.role,
    fechaOriginal: new Date(cronograma.fechaProgramada),
    horaOriginal: cronograma.horaInicio,
    fechaPropuesta: new Date(dto.fechaPropuesta),
    horaPropuesta: dto.horaPropuesta,
    justificacion: dto.justificacion,
    archivoSustentoUrl,
  };
  return solicitudRepo.create(data);
}

export async function aprobarSolicitud(
  cronogramaRepo: CronogramaRepository,
  solicitudRepo: SolicitudReprogramacionRepository,
  scopeFilter: ScopeFilter,
  id: string,
  dto: ResolverSolicitudDto,
  session: SessionUser,
): Promise<ISolicitudReprogramacion> {
  return resolverSolicitud(cronogramaRepo, solicitudRepo, scopeFilter, id, 'APROBADO', dto, session);
}

export async function rechazarSolicitud(
  cronogramaRepo: CronogramaRepository,
  solicitudRepo: SolicitudReprogramacionRepository,
  scopeFilter: ScopeFilter,
  id: string,
  dto: ResolverSolicitudDto,
  session: SessionUser,
): Promise<ISolicitudReprogramacion> {
  return resolverSolicitud(cronogramaRepo, solicitudRepo, scopeFilter, id, 'RECHAZADO', dto, session);
}

async function resolverSolicitud(
  cronogramaRepo: CronogramaRepository,
  solicitudRepo: SolicitudReprogramacionRepository,
  scopeFilter: ScopeFilter,
  id: string,
  estado: 'APROBADO' | 'RECHAZADO',
  dto: ResolverSolicitudDto,
  session: SessionUser,
): Promise<ISolicitudReprogramacion> {
  const solicitud = await solicitudRepo.findById(id);
  if (!solicitud) throw new NotFoundException(`Solicitud ${id} no encontrada.`);

  const cronograma = await cronogramaRepo.findById(solicitud.cronogramaId);
  if (!cronograma) throw new NotFoundException(`Cronograma asociado no encontrado.`);

  const isAll = scopeFilter.isAllScope(session.role);
  const isJefeArea = scopeFilter.isJefeAreaScope(session.role);
  const isDirector = session.role === RoleCode.DIRECTOR_INSTITUCION;

  if (!isAll) {
    if (isJefeArea) {
      if (cronograma.nivelEducativo !== session.especialistaNivel) {
        throw new ForbiddenException(
          'El Jefe de Area solo puede resolver solicitudes de su propio nivel educativo.',
        );
      }

      if (
        cronograma.nivelEducativo === 'Secundaria' &&
        session.especialistaEspecialidades &&
        session.especialistaEspecialidades.length > 0
      ) {
        const monitorEspecialidades = await cronogramaRepo.findMonitorEspecialidades(cronograma.monitorId);
        const monitorEspecs = monitorEspecialidades.map((e) => e.especialidad.nombre);
        const hasOverlap = session.especialistaEspecialidades.some((e) => monitorEspecs.includes(e));
        if (!hasOverlap && monitorEspecs.length > 0) {
          throw new ForbiddenException(
            'El Jefe de Area solo puede resolver solicitudes de especialistas de su misma especialidad.',
          );
        }
      }
    } else if (isDirector) {
      if (cronograma.nivelEducativo !== 'Secundaria') {
        throw new ForbiddenException(
          'El Director IE solo puede resolver solicitudes de nivel Secundaria.',
        );
      }
      if (cronograma.institucionId !== session.institucionId) {
        throw new ForbiddenException(
          'El Director IE solo puede resolver solicitudes de su propia institución.',
        );
      }
    } else {
      throw new ForbiddenException(
        'Solo Jefe de Gestion, Jefe de Area o Directores IE pueden resolver solicitudes de reprogramacion.',
      );
    }
  }

  if (solicitud.estado !== 'PENDIENTE') {
    throw new BadRequestException(
      `La solicitud ya esta ${solicitud.estado}, no se puede ${estado.toLowerCase()}.`,
    );
  }

  const data: ResolverSolicitudData = {
    estado,
    resueltoPorId: session.id,
    comentarioResolucion: dto.comentario,
  };
  const resuelta = await solicitudRepo.resolver(id, data);

  if (estado === 'APROBADO') {
    await cronogramaRepo.applyReprogramacion(
      solicitud.cronogramaId,
      new Date(solicitud.fechaPropuesta),
      solicitud.horaPropuesta,
    );
  }
  return resuelta;
}
