import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { STORAGE_SERVICE, type StorageService } from '../../../shared/storage/storage.constants.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IVisita, ISolicitudReprogramacion } from '@sistema-monitoreo/shared-contracts';
import {
  CronogramaRepository,
  SolicitudReprogramacionRepository,
} from '../repositories/cronograma.repository.js';
import type {
  CreateVisitaData,
  UpdateVisitaData,
  CreateSolicitudData,
  ResolverSolicitudData,
} from '../repositories/cronograma.repository.js';
import type { CreateVisitaDto, UpdateVisitaDto } from '../dto/create-visita.dto.js';
import type {
  CreateSolicitudReprogramacionDto,
  ResolverSolicitudDto,
} from '../dto/solicitud-reprogramacion.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';

export interface SessionUser {
  id: string;
  role: RoleCode;
  institucionId?: string | null;
  especialistaNivel?: string | null;
}

@Injectable()
export class SchedulingService {
  constructor(
    private readonly cronogramaRepo: CronogramaRepository,
    private readonly solicitudRepo: SolicitudReprogramacionRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly prisma: PrismaService,
    private readonly scopeFilter: ScopeFilter,
  ) {}

  private toScopeContext(session: SessionUser): ScopeContext {
    return {
      userId: session.id,
      role: session.role,
      institucionId: session.institucionId,
      especialistaNivel: session.especialistaNivel,
    };
  }

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

    // Regla de negocio: max 3 visitas activas por especialista (EDU-0011/0015).
    // La BD tambien lo garantiza con el trigger trg_validar_max_tres_pendientes;
    // aqui damos un mensaje claro al cliente antes de llegar al INSERT.
    const pendientes = await this.cronogramaRepo.countPendientesByMonitor(dto.monitorId);
    if (pendientes >= 3) {
      throw new BadRequestException(
        'El especialista ya tiene 3 visitas pendientes. Complete o cancele una antes de programar otra.',
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      estado: dto.estado as any,
    };
    return this.cronogramaRepo.update(id, data);
  }

  async eliminarVisita(id: string, session: SessionUser): Promise<void> {
    const existing = await this.cronogramaRepo.findById(id);
    if (!existing) throw new NotFoundException(`Visita ${id} no encontrada.`);
    this.validarAccesoVisita(existing, session);
    if (existing.estado === 'COMPLETADO') {
      throw new BadRequestException(
        'No se puede eliminar una visita en estado COMPLETADO (tiene ficha asociada).',
      );
    }
    await this.cronogramaRepo.remove(id);
  }

  // ============== Solicitudes ==============

  async findAllSolicitudes(filters?: any): Promise<ISolicitudReprogramacion[]> {
    return this.solicitudRepo.findAll(filters);
  }

  async findSolicitudById(id: string): Promise<ISolicitudReprogramacion> {
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

    if (cronograma.nivelEducativo === 'Primaria' || cronograma.nivelEducativo === 'Inicial') {
      throw new BadRequestException(
        'No se permiten solicitudes de reprogramación para los niveles de Inicial o Primaria.',
      );
    }

    let archivoSustentoUrl = '';
    if (dto.archivoSustentoBase64) {
      const buffer = Buffer.from(dto.archivoSustentoBase64, 'base64');
      const stored = await this.storage.savePdf(
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
      throw new BadRequestException(
        `La solicitud ya esta ${solicitud.estado}, no se puede ${estado.toLowerCase()}.`,
      );
    }

    const data: ResolverSolicitudData = {
      estado,
      resueltoPorId: session.id,
      comentarioResolucion: dto.comentario,
    };
    const resuelta = await this.solicitudRepo.resolver(id, data);

    // Si se aprobo, mutamos el cronograma en la misma operacion
    if (estado === 'APROBADO') {
      // El trigger SQL exige esta bandera de sesion para aceptar el UPDATE.
      // Usamos una transaccion explicita para asegurar que corran en la misma conexion.
      await this.prisma.$transaction([
        this.prisma.$executeRawUnsafe(
          `SELECT set_config('app.reprogramacion_apply', 'true', true)`,
        ),
        this.prisma.cronograma.update({
          where: { id: solicitud.cronogramaId },
          data: {
            fechaProgramada: new Date(solicitud.fechaPropuesta),
            horaInicio: solicitud.horaPropuesta,
            estado: 'REPROGRAMADO',
          },
        }),
      ]);
    }
    return resuelta;
  }

  // ============== Helpers ==============

  private esAutoridad(session: SessionUser): boolean {
    // Equivale a "puede crear/editar cronogramas": ALL + INSTITUCION.
    return (
      this.scopeFilter.isAllScope(session.role) || this.scopeFilter.isInstitucionScope(session.role)
    );
  }

  private aplicarScopingVisitas(visitas: IVisita[], session?: SessionUser): IVisita[] {
    if (!session) return visitas;
    const ctx = this.toScopeContext(session);
    if (this.scopeFilter.isAllScope(ctx.role)) return visitas;
    if (this.scopeFilter.isInstitucionScope(ctx.role)) {
      return ctx.institucionId ? visitas.filter((v) => v.institucionId === ctx.institucionId) : [];
    }
    if (this.scopeFilter.isMonitorScope(ctx.role)) {
      // Especialista: se filtra en repository por monitorId.
      return visitas;
    }
    if (this.scopeFilter.isJefeAreaScope(ctx.role)) {
      return visitas.filter((v) => v.nivelEducativo === ctx.especialistaNivel);
    }
    return [];
  }

  private validarAccesoVisita(visita: IVisita, session?: SessionUser): void {
    if (!session) return;
    const ctx = this.toScopeContext(session);
    if (this.scopeFilter.isAllScope(ctx.role)) return;
    if (this.scopeFilter.isInstitucionScope(ctx.role)) {
      if (visita.institucionId !== ctx.institucionId) {
        throw new ForbiddenException('No tiene acceso a esta visita (otra institucion).');
      }
    }
  }
}
