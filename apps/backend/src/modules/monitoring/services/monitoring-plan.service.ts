/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IMonitoringPlanResponse,
  IPlanInstitucionCubierta,
} from '@sistema-monitoreo/shared-contracts';
import { MonitoringPlanRepository } from '../repositories/monitoring-plan.repository.js';
import type { CreatePlanDto } from '../dto/create-plan.dto.js';
import type { QueryPlanDto } from '../dto/query-plan.dto.js';

export interface SessionUser {
  id: string;
  role: string;
  institucionId?: string | null;
}

@Injectable()
export class MonitoringPlanService {
  constructor(private readonly repository: MonitoringPlanRepository) {}

  async findAll(filters?: QueryPlanDto, session?: SessionUser): Promise<IMonitoringPlanResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string, session?: SessionUser): Promise<IMonitoringPlanResponse> {
    const plan = await this.repository.findById(id);
    if (!plan) {
      throw new NotFoundException(`Plan de monitoreo con ID ${id} no encontrado.`);
    }
    if (session && this.isDirector(session) && plan.tipoEntidad !== 'IE') {
      throw new ForbiddenException('No cuenta con permisos para ver este plan.');
    }
    return plan;
  }

  async create(dto: CreatePlanDto, session: SessionUser): Promise<IMonitoringPlanResponse> {
    const { tipoEntidad, institucionId } = this.resolvePlanScope(session, dto);

    // Validar si ya existe un plan activo para este año y entidad
    const existing = await this.repository.findAll({
      anioAcademico: dto.anioAcademico,
      tipoEntidad,
      estado: 'Activo',
    });

    const isDuplicate = existing.some((plan) => {
      if (tipoEntidad === 'IE') {
        return plan.autorId === session.id;
      }
      return true; // Para UGEL es global por año
    });

    if (isDuplicate) {
      throw new ConflictException(
        `Solo se puede subir 1 plan de monitoreo activo por año para ${
          tipoEntidad === 'UGEL' ? 'la UGEL' : 'esta Institución Educativa'
        }.`,
      );
    }

    return this.repository.create({
      titulo: dto.titulo,
      anioAcademico: dto.anioAcademico,
      archivoUrl: dto.archivoUrl!,
      tipoEntidad,
      autorId: session.id,
      rolAutorAlCrear: this.toRolAutor(session.role),
      institucionId,
    });
  }

  async toggleEstado(id: string, session?: SessionUser): Promise<IMonitoringPlanResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan de monitoreo con ID ${id} no encontrado.`);
    }
    if (session && this.isDirector(session) && existing.tipoEntidad !== 'IE') {
      throw new ForbiddenException('No cuenta con permisos para modificar este plan.');
    }
    return this.repository.softDelete(id);
  }

  async findCobertura(id: string, session?: SessionUser): Promise<IPlanInstitucionCubierta[]> {
    const plan = await this.findById(id, session);
    return this.repository.findCobertura(plan.id);
  }

  async addCobertura(
    id: string,
    institucionId: string,
    session: SessionUser,
  ): Promise<IPlanInstitucionCubierta[]> {
    if (this.isDirector(session)) {
      throw new ForbiddenException(
        'Directores IE no pueden modificar la cobertura de planes UGEL.',
      );
    }
    const plan = await this.findById(id, session);
    await this.repository.addCobertura(plan.id, institucionId);
    return this.repository.findCobertura(plan.id);
  }

  async removeCobertura(
    id: string,
    institucionId: string,
    session: SessionUser,
  ): Promise<IPlanInstitucionCubierta[]> {
    if (this.isDirector(session)) {
      throw new ForbiddenException(
        'Directores IE no pueden modificar la cobertura de planes UGEL.',
      );
    }
    const plan = await this.findById(id, session);
    await this.repository.removeCobertura(plan.id, institucionId);
    return this.repository.findCobertura(plan.id);
  }

  private isDirector(session: SessionUser): boolean {
    return session.role === 'director_institucion' || session.role === 'director_ie';
  }

  private toRolAutor(role: string): 'jefe_gestion' | 'director_ie' {
    if (this.isDirector({ id: '', role })) return 'director_ie';
    return 'jefe_gestion';
  }

  private resolvePlanScope(
    session: SessionUser,
    dto: CreatePlanDto,
  ): { tipoEntidad: string; institucionId: string | null } {
    if (this.isDirector(session)) {
      const institucionId = session.institucionId ?? dto.institucionId ?? null;
      if (!institucionId) {
        throw new ForbiddenException(
          'El director IE debe tener institucionId en sesion o body para crear un plan.',
        );
      }
      return { tipoEntidad: 'IE', institucionId };
    }
    return { tipoEntidad: 'UGEL', institucionId: null };
  }
}
