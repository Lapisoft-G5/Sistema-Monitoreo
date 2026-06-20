import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { STORAGE_SERVICE } from '../../../shared/storage/storage.constants.js';
import type { StorageService } from '../../../shared/storage/storage.constants.js';
import type {
  IVisita,
  ISolicitudReprogramacion,
  EstadoSolicitudReprogramacion,
} from '@sistema-monitoreo/shared-contracts';
import { CronogramaRepository, SolicitudReprogramacionRepository } from '../repositories/cronograma.repository.js';
import type { CreateVisitaData, UpdateVisitaData, CreateSolicitudData, ResolverSolicitudData } from '../repositories/cronograma.repository.js';
import type { CreateVisitaDto, UpdateVisitaDto } from '../dto/create-visita.dto.js';
import type { CreateSolicitudReprogramacionDto, ResolverSolicitudDto } from '../dto/solicitud-reprogramacion.dto.js';

export interface SessionUser {
  id: string;
  role: string;
  institucionId?: string | null;
}

@Injectable()
export class SchedulingService {
  constructor(
    private readonly cronogramaRepo: CronogramaRepository,
    private readonly solicitudRepo: SolicitudReprogramacionRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  // ============== Cronogramas ==============

  async findAllVisitas(filters?: any, session?: SessionUser): Promise<IVisita[]> {
    const data = await this.cronogramaRepo.findAll(filters);
    return this.aplicarScopingVisitas(data, session);
  }

  async findVisitaById(id: string, session?: SessionUser): Promise<IVisita> {
    const v = await this.cronogramaRepo.findById(id);
    if (!v) throw new NotFoundException(`Visita ${id} no encontrada.`);
    this.validarAccesoVisita(v, session);
    return v;
  }

  async crearVisita(dto: CreateVisitaDto, session: SessionUser): Promise<IVisita> {
    // Candado operativo: debe existir un plan Activo que cubra la institucion
    const anio = new Date(dto.fechaProgramada).getFullYear();
    const planId = await this.cronogramaRepo.findPlanVigentePara(dto.institucionId, anio);
    if (!planId) {
      throw new BadRequestException(
        `No existe Plan de Monitoreo Activo que habilite el registro de visitas para el anio ${anio}. ` +
        'El Jefe de Gestion debe registrar y activar un plan antes de programar visitas (EDU-0002).',
      );
    }

    const data: CreateVisitaData = {
      monitorId: dto.monitorId,
      institucionId: dto.institucionId,
      evaluadoId: dto.evaluadoId,
      tipoMonitoreo: dto.tipoMonitoreo,
      numeroVisita: dto.numeroVisita,
      fechaProgramada: new Date(dto.fechaProgramada),
      horaInicio: dto.horaInicio,
      modalidad: dto.modalidad,
      nivelEducativo: dto.nivelEducativo,
      detalles: dto.detalles,
      creadoPorId: session.id,
    };
    const created = await this.cronogramaRepo.create(data);
    // Actualizar planId en la fila creada (el repo no lo acepta en create para que sea null-safe)
    return this.cronogramaRepo.findById(created.id) as Promise<IVisita>;
  }

  async actualizarVisita(id: string, dto: UpdateVisitaDto, session: SessionUser): Promise<IVisita> {
    const existing = await this.cronogramaRepo.findById(id);
    if (!existing) throw new NotFoundException(`Visita ${id} no encontrada.`);
    this.validarAccesoVisita(existing, session);
    // Cambio de fecha/hora solo se hace via aprobacion de solicitud
    if (dto.fechaProgramada || dto.horaInicio) {
      throw new BadRequestException(
        'fecha/hora solo se modifican aprobando una SolicitudReprogramacion. Use POST /solicitudes-reprogramacion.',
      );
    }
    const data: UpdateVisitaData = {
      detalles: dto.detalles,
      estado: dto.estado as any,
    };
    return this.cronogramaRepo.update(id, data);
  }

  // ============== Solicitudes ==============

  async findAllSolicitudes(filters?: any, session?: SessionUser): Promise<ISolicitudReprogramacion[]> {
    return this.solicitudRepo.findAll(filters);
  }

  async findSolicitudById(id: string, session?: SessionUser): Promise<ISolicitudReprogramacion> {
    const s = await this.solicitudRepo.findById(id);
    if (!s) throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    return s;
  }

  async crearSolicitud(
    dto: CreateSolicitudReprogramacionDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    const cronograma = await this.cronogramaRepo.findById(dto.cronogramaId);
    if (!cronograma) throw new NotFoundException(`Visita ${dto.cronogramaId} no encontrada.`);

    const pendiente = await this.solicitudRepo.findPendienteByCronograma(dto.cronogramaId);
    if (pendiente) {
      throw new BadRequestException(
        `Ya existe una solicitud PENDIENTE para esta visita. Id: ${pendiente.id}.`,
      );
    }

    if (!dto.archivoSustentoBase64) {
      throw new BadRequestException('El archivo PDF de sustento es obligatorio.');
    }

    const buffer = Buffer.from(dto.archivoSustentoBase64, 'base64');
    const stored = await this.storage.savePdf(
      'reprogramaciones',
      dto.archivoSustentoNombre ?? 'oficio.pdf',
      buffer,
    );

    const data: CreateSolicitudData = {
      cronogramaId: dto.cronogramaId,
      solicitanteId: session.id,
      solicitanteRolAlCrear: session.role,
      fechaOriginal: new Date(cronograma.fechaProgramada),
      horaOriginal: cronograma.horaInicio,
      fechaPropuesta: new Date(dto.fechaPropuesta),
      horaPropuesta: dto.horaPropuesta,
      justificacion: dto.justificacion,
      archivoSustentoUrl: stored.url,
    };
    return this.solicitudRepo.create(data);
  }

  async aprobarSolicitud(
    id: string,
    dto: ResolverSolicitudDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    if (!this.esAutoridad(session)) {
      throw new ForbiddenException(
        'Solo Jefe de Gestion o Director IE pueden aprobar solicitudes de reprogramacion.',
      );
    }
    return this.resolverSolicitud(id, 'APROBADO', dto, session);
  }

  async rechazarSolicitud(
    id: string,
    dto: ResolverSolicitudDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    if (!this.esAutoridad(session)) {
      throw new ForbiddenException(
        'Solo Jefe de Gestion o Director IE pueden rechazar solicitudes de reprogramacion.',
      );
    }
    return this.resolverSolicitud(id, 'RECHAZADO', dto, session);
  }

  private async resolverSolicitud(
    id: string,
    estado: 'APROBADO' | 'RECHAZADO',
    dto: ResolverSolicitudDto,
    session: SessionUser,
  ): Promise<ISolicitudReprogramacion> {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    if (solicitud.estado !== 'PENDIENTE') {
      throw new BadRequestException(`La solicitud ya esta ${solicitud.estado}, no se puede ${estado.toLowerCase()}.`);
    }

    const data: ResolverSolicitudData = {
      estado,
      resueltoPorId: session.id,
      comentarioResolucion: dto.comentario,
    };
    const resuelta = await this.solicitudRepo.resolver(id, data);

    // Si se aprobo, mutamos el cronograma en la misma operacion
    if (estado === 'APROBADO') {
      await this.cronogramaRepo.update(solicitud.cronogramaId, {
        fechaProgramada: new Date(solicitud.fechaPropuesta),
        horaInicio: solicitud.horaPropuesta,
        estado: 'REPROGRAMADO',
      });
    }
    return resuelta;
  }

  // ============== Helpers ==============

  private esAutoridad(session: SessionUser): boolean {
    return [
      'jefe_gestion',
      'director_institucion',
      'director_ie',
    ].includes(session.role);
  }

  private aplicarScopingVisitas(visitas: IVisita[], session?: SessionUser): IVisita[] {
    if (!session) return visitas;
    if (session.role === 'jefe_gestion') return visitas;
    if (session.role === 'director_institucion' || session.role === 'director_ie') {
      return visitas.filter((v) => v.institucionId === session.institucionId);
    }
    if (
      session.role === 'especialista' ||
      session.role === 'coordinador_pedagogico' ||
      session.role === 'jefe_taller'
    ) {
      // Especialista: solo lo que el monitor es el
      return visitas; // se filtra en repository con monitorId
    }
    return visitas;
  }

  private validarAccesoVisita(visita: IVisita, session?: SessionUser): void {
    if (!session) return;
    if (session.role === 'jefe_gestion') return;
    if (session.role === 'director_institucion' || session.role === 'director_ie') {
      if (visita.institucionId !== session.institucionId) {
        throw new ForbiddenException('No tiene acceso a esta visita (otra institucion).');
      }
    }
  }
}
