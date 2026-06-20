import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { MonitoringPlanRepository } from './monitoring-plan.repository.js';
import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';
import type { QueryPlanDto } from '../dto/query-plan.dto.js';

@Injectable()
export class PrismaMonitoringPlanRepository implements MonitoringPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(plan: any): IMonitoringPlanResponse {
    return {
      id: plan.id,
      titulo: plan.titulo,
      anioAcademico: plan.anioAcademico,
      tipoEntidad: plan.tipoEntidad,
      archivoUrl: plan.archivoUrl,
      estado: plan.estado,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  async findAll(filters?: QueryPlanDto): Promise<IMonitoringPlanResponse[]> {
    const where: Prisma.PlanMonitoreoWhereInput = {
      deleted: false,
    };

    if (filters) {
      if (filters.search) {
        where.titulo = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }
      if (filters.anioAcademico !== undefined) {
        where.anioAcademico = filters.anioAcademico;
      }
      if (filters.tipoEntidad !== undefined) {
        where.tipoEntidad = filters.tipoEntidad;
      }
      if (filters.estado !== undefined) {
        where.estado = filters.estado;
      }
    }

    const plans = await this.prisma.planMonitoreo.findMany({
      where,
      orderBy: [
        { anioAcademico: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return plans.map((p) => this.mapToResponse(p));
  }

  async findById(id: string): Promise<IMonitoringPlanResponse | null> {
    const plan = await this.prisma.planMonitoreo.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
    if (!plan) return null;
    return this.mapToResponse(plan);
  }

  async create(data: {
    titulo: string;
    anioAcademico: number;
    tipoEntidad: string;
    archivoUrl: string;
  }): Promise<IMonitoringPlanResponse> {
    const plan = await this.prisma.planMonitoreo.create({
      data: {
        titulo: data.titulo,
        anioAcademico: data.anioAcademico,
        tipoEntidad: data.tipoEntidad,
        archivoUrl: data.archivoUrl,
      },
    });
    return this.mapToResponse(plan);
  }

  async delete(id: string): Promise<IMonitoringPlanResponse> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan de monitoreo con ID ${id} no encontrado.`);
    }

    const plan = await this.prisma.planMonitoreo.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        estado: 'Inactivo',
      },
    });

    return this.mapToResponse(plan);
  }
}
