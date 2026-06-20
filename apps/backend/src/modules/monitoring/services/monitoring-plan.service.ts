import { Injectable, NotFoundException } from '@nestjs/common';
import { MonitoringPlanRepository } from '../repositories/monitoring-plan.repository.js';
import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';
import type { CreatePlanDto } from '../dto/create-plan.dto.js';
import type { QueryPlanDto } from '../dto/query-plan.dto.js';

@Injectable()
export class MonitoringPlanService {
  constructor(private readonly repository: MonitoringPlanRepository) {}

  async findAll(filters?: QueryPlanDto): Promise<IMonitoringPlanResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string): Promise<IMonitoringPlanResponse> {
    const plan = await this.repository.findById(id);
    if (!plan) {
      throw new NotFoundException(`Plan de monitoreo con ID ${id} no encontrado.`);
    }
    return plan;
  }

  async create(dto: CreatePlanDto, archivoUrl: string): Promise<IMonitoringPlanResponse> {
    return this.repository.create({
      titulo: dto.titulo,
      anioAcademico: dto.anioAcademico,
      tipoEntidad: dto.tipoEntidad,
      archivoUrl,
    });
  }

  async delete(id: string): Promise<IMonitoringPlanResponse> {
    return this.repository.delete(id);
  }
}
