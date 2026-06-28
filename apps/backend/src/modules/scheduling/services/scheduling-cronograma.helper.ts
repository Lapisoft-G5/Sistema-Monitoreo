import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IVisita, EstadoVisita } from '@sistema-monitoreo/shared-contracts';
import type {
  CronogramaRepository,
  CreateVisitaData,
  UpdateVisitaData,
} from '../repositories/cronograma.repository.js';
import type { CreateVisitaDto, UpdateVisitaDto } from '../dto/create-visita.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { ScopeFilter, ScopeContext } from '../../../shared/auth/scope-filter.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

function toScopeContext(session: SessionUser): ScopeContext {
  return {
    userId: session.id,
    role: session.role,
    institucionId: session.institucionId,
    especialistaNivel: session.especialistaNivel,
    especialistaEspecialidades: session.especialistaEspecialidades,
  };
}

function aplicarScopingVisitas(
  visitas: IVisita[],
  scopeFilter: ScopeFilter,
  session?: SessionUser,
): IVisita[] {
  if (!session) return visitas;
  const ctx = toScopeContext(session);
  if (scopeFilter.isAllScope(ctx.role)) return visitas;
  if (scopeFilter.isInstitucionScope(ctx.role)) {
    return ctx.institucionId ? visitas.filter((v) => v.institucionId === ctx.institucionId) : [];
  }
  if (scopeFilter.isMonitorScope(ctx.role)) return visitas;
  if (scopeFilter.isJefeAreaScope(ctx.role)) {
    return visitas.filter((v) => v.nivelEducativo === ctx.especialistaNivel);
  }
  return [];
}

function validarAccesoVisita(
  visita: IVisita,
  scopeFilter: ScopeFilter,
  session?: SessionUser,
): void {
  if (!session) return;
  const ctx = toScopeContext(session);
  if (scopeFilter.isAllScope(ctx.role)) return;
  if (scopeFilter.isInstitucionScope(ctx.role)) {
    if (visita.institucionId !== ctx.institucionId) {
      throw new ForbiddenException('No tiene acceso a esta visita (otra institucion).');
    }
  }
}

export async function findAllVisitas(
  cronogramaRepo: CronogramaRepository,
  scopeFilter: ScopeFilter,
  filters?: Record<string, unknown>,
  session?: SessionUser,
): Promise<IVisita[]> {
  const queryFilters: Record<string, unknown> = { ...filters };
  if (session) {
    const ctx = toScopeContext(session);
    if (scopeFilter.isJefeAreaScope(ctx.role)) {
      if (ctx.especialistaEspecialidades && ctx.especialistaEspecialidades.length > 0) {
        queryFilters.monitorEspecialidades = ctx.especialistaEspecialidades;
      }
    }
  }
  const data = await cronogramaRepo.findAll(queryFilters);
  return aplicarScopingVisitas(data, scopeFilter, session);
}

export async function findVisitaById(
  cronogramaRepo: CronogramaRepository,
  scopeFilter: ScopeFilter,
  id: string,
  session?: SessionUser,
): Promise<IVisita> {
  const v = await cronogramaRepo.findById(id);
  if (!v) throw new NotFoundException(`Visita ${id} no encontrada.`);
  validarAccesoVisita(v, scopeFilter, session);
  return v;
}

export async function crearVisita(
  cronogramaRepo: CronogramaRepository,
  scopeFilter: ScopeFilter,
  dto: CreateVisitaDto,
  session: SessionUser,
): Promise<IVisita> {
  if (session.role === RoleCode.JEFE_AREA) {
    const jefeNivel = session.especialistaNivel;
    const targetMod = dto.modalidad || 'EBR';
    const targetNivel = dto.nivelEducativo;

    if (jefeNivel === 'Inicial') {
      const isValid = (targetMod === 'EBR' && targetNivel === 'Inicial') || targetMod === 'EBE';
      if (!isValid) {
        throw new ForbiddenException(
          'Un Jefe de Área de nivel Inicial solo puede registrar visitas de nivel Inicial (EBR) o de la modalidad Especial (EBE).',
        );
      }
    } else if (jefeNivel === 'Primaria') {
      const isValid = targetMod === 'EBR' && targetNivel === 'Primaria';
      if (!isValid) {
        throw new ForbiddenException(
          'Un Jefe de Área de nivel Primaria solo puede registrar visitas de nivel Primaria (EBR).',
        );
      }
    } else if (jefeNivel === 'Secundaria') {
      const isValid =
        (targetMod === 'EBR' && targetNivel === 'Secundaria') ||
        targetMod === 'EBA' ||
        targetMod === 'CEPTRO';
      if (!isValid) {
        throw new ForbiddenException(
          'Un Jefe de Área de nivel Secundaria solo puede registrar visitas de nivel Secundaria (EBR), Alternativa (EBA) o CEPTRO.',
        );
      }
    }
  }

  const anio = new Date(dto.fechaProgramada).getFullYear();
  const planId = await cronogramaRepo.findPlanVigentePara(dto.institucionId, anio);
  if (!planId) {
    throw new BadRequestException(
      `No existe Plan de Monitoreo Activo que habilite el registro de visitas para el anio ${anio}. ` +
        'El Jefe de Gestion debe registrar y activar un plan antes de programar visitas (EDU-0002).',
    );
  }

  const activas = await cronogramaRepo.validateEntidadesActivas(
    dto.institucionId,
    dto.monitorId,
    dto.evaluadoId,
  );
  if (!activas.institucion) {
    throw new BadRequestException('La institución educativa seleccionada no está Activa.');
  }
  if (!activas.monitor) {
    throw new BadRequestException('El monitor (especialista/director) seleccionado no está activo.');
  }
  if (activas.monitorCargo === 'Jefe de Área') {
    throw new ForbiddenException('Los Jefes de Área no pueden realizar visitas (rol no evaluador).');
  }
  if (!activas.evaluado) {
    throw new BadRequestException('El evaluado (docente/director) seleccionado no está activo.');
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
  const created = await cronogramaRepo.create(data);
  return cronogramaRepo.findById(created.id) as Promise<IVisita>;
}

export async function actualizarVisita(
  cronogramaRepo: CronogramaRepository,
  scopeFilter: ScopeFilter,
  id: string,
  dto: UpdateVisitaDto,
  session: SessionUser,
): Promise<IVisita> {
  const existing = await cronogramaRepo.findById(id);
  if (!existing) throw new NotFoundException(`Visita ${id} no encontrada.`);
  validarAccesoVisita(existing, scopeFilter, session);
  if (dto.fechaProgramada || dto.horaInicio) {
    throw new BadRequestException(
      'fecha/hora solo se modifican aprobando una SolicitudReprogramacion. Use POST /solicitudes-reprogramacion.',
    );
  }
  const data: UpdateVisitaData = {
    detalles: dto.detalles,
    estado: dto.estado as EstadoVisita,
  };
  return cronogramaRepo.update(id, data);
}

export async function eliminarVisita(
  cronogramaRepo: CronogramaRepository,
  scopeFilter: ScopeFilter,
  id: string,
  session: SessionUser,
): Promise<void> {
  const existing = await cronogramaRepo.findById(id);
  if (!existing) throw new NotFoundException(`Visita ${id} no encontrada.`);
  validarAccesoVisita(existing, scopeFilter, session);
  if (existing.estado === 'COMPLETADO') {
    throw new BadRequestException(
      'No se puede eliminar una visita en estado COMPLETADO (tiene ficha asociada).',
    );
  }
  await cronogramaRepo.remove(id);
}
