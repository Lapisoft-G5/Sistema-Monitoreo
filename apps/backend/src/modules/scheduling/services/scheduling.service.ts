import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_SERVICE, type StorageService } from '../../../shared/storage/storage.constants.js';
import type { IVisita, ISolicitudReprogramacion } from '@sistema-monitoreo/shared-contracts';
import {
  CronogramaRepository,
  SolicitudReprogramacionRepository,
} from '../repositories/cronograma.repository.js';
import type { CreateVisitaDto, UpdateVisitaDto } from '../dto/create-visita.dto.js';
import type {
  CreateSolicitudReprogramacionDto,
  ResolverSolicitudDto,
} from '../dto/solicitud-reprogramacion.dto.js';
import { ScopeFilter } from '../../../shared/auth/scope-filter.js';
import type { SessionUser } from '../../../shared/types/session-user.js';
import {
  findAllVisitas,
  findVisitaById,
  crearVisita,
  actualizarVisita,
  eliminarVisita,
} from './scheduling-cronograma.helper.js';
import {
  findAllSolicitudes,
  findSolicitudById,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
} from './scheduling-solicitud.helper.js';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly cronogramaRepo: CronogramaRepository,
    private readonly solicitudRepo: SolicitudReprogramacionRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly scopeFilter: ScopeFilter,
  ) {}

  async findAllVisitas(filters?: Record<string, unknown>, session?: SessionUser): Promise<IVisita[]> {
    return findAllVisitas(this.cronogramaRepo, this.scopeFilter, filters, session);
  }

  async findVisitaById(id: string, session?: SessionUser): Promise<IVisita> {
    return findVisitaById(this.cronogramaRepo, this.scopeFilter, id, session);
  }

  async crearVisita(dto: CreateVisitaDto, session: SessionUser): Promise<IVisita> {
    return crearVisita(this.cronogramaRepo, this.scopeFilter, dto, session);
  }

  async actualizarVisita(id: string, dto: UpdateVisitaDto, session: SessionUser): Promise<IVisita> {
    return actualizarVisita(this.cronogramaRepo, this.scopeFilter, id, dto, session);
  }

  async eliminarVisita(id: string, session: SessionUser): Promise<void> {
    return eliminarVisita(this.cronogramaRepo, this.scopeFilter, id, session);
  }

  async findAllSolicitudes(filters?: any): Promise<ISolicitudReprogramacion[]> {
    return findAllSolicitudes(this.solicitudRepo, filters);
  }

  async findSolicitudById(id: string): Promise<ISolicitudReprogramacion> {
    return findSolicitudById(this.solicitudRepo, id);
  }

  async crearSolicitud(
    dto: CreateSolicitudReprogramacionDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    return crearSolicitud(this.cronogramaRepo, this.solicitudRepo, this.storage, dto, session);
  }

  async aprobarSolicitud(
    id: string,
    dto: ResolverSolicitudDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    return aprobarSolicitud(this.cronogramaRepo, this.solicitudRepo, this.scopeFilter, id, dto, session);
  }

  async rechazarSolicitud(
    id: string,
    dto: ResolverSolicitudDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    return rechazarSolicitud(this.cronogramaRepo, this.solicitudRepo, this.scopeFilter, id, dto, session);
  }
}
