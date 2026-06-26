/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IVisita, ISolicitudReprogramacion } from '@sistema-monitoreo/shared-contracts';
import {
  CronogramaRepository,
  CreateVisitaData,
  UpdateVisitaData,
  SolicitudReprogramacionRepository,
  CreateSolicitudData,
  ResolverSolicitudData,
} from './cronograma.repository.js';
import { fromPrismaVisita, fromPrismaSolicitud } from './cronograma.mapper.js';

@Injectable()
export class PrismaCronogramaRepository implements CronogramaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapVisita(v: any): IVisita {
    return fromPrismaVisita(v);
  }

  async findAll(filters?: any): Promise<IVisita[]> {
    const where: any = {};
    if (filters) {
      if (filters.monitorId) where.monitorId = filters.monitorId;
      if (filters.institucionId) where.institucionId = filters.institucionId;
      if (filters.estado) where.estado = filters.estado;
      if (filters.tipoMonitoreo) where.tipoMonitoreo = filters.tipoMonitoreo;
      if (filters.fechaDesde || filters.fechaHasta) {
        where.fechaProgramada = {};
        if (filters.fechaDesde) where.fechaProgramada.gte = new Date(filters.fechaDesde);
        if (filters.fechaHasta) where.fechaProgramada.lte = new Date(filters.fechaHasta);
      }
      if (filters.monitorEspecialidades && filters.monitorEspecialidades.length > 0) {
        where.monitor = {
          especialidades: {
            some: {
              especialidad: {
                nombre: { in: filters.monitorEspecialidades },
              },
            },
          },
        };
      }
    }
    const rows = await this.prisma.cronograma.findMany({
      where,
      orderBy: [{ fechaProgramada: 'asc' }, { horaInicio: 'asc' }],
    });
    return rows.map((r) => this.mapVisita(r));
  }

  async findById(id: string): Promise<IVisita | null> {
    const row = await this.prisma.cronograma.findUnique({ where: { id } });
    return row ? this.mapVisita(row) : null;
  }

  async findPlanVigentePara(institucionId: string, anio: number): Promise<string | null> {
    // 1. Plan UGEL del anio
    const planUgel = await this.prisma.planMonitoreo.findFirst({
      where: { anioAcademico: anio, tipoEntidad: 'UGEL', estado: 'Activo', deleted: false },
    });
    if (!planUgel) return null;

    // 2. Plan IE que cubra la institucion
    const planIe = await this.prisma.planMonitoreo.findFirst({
      where: {
        anioAcademico: anio,
        tipoEntidad: 'IE',
        estado: 'Activo',
        deleted: false,
        cobertura: { some: { institucionId } },
      },
    });
    return planIe?.id ?? planUgel.id;
  }

  async countPendientesByMonitor(monitorId: string): Promise<number> {
    return this.prisma.cronograma.count({
      where: {
        monitorId,
        estado: { in: ['PROGRAMADO', 'EN_PROCESO', 'REPROGRAMADO'] },
      },
    });
  }

  async create(data: CreateVisitaData): Promise<IVisita> {
    const row = await this.prisma.cronograma.create({
      data: {
        monitorId: data.monitorId,
        institucionId: data.institucionId,
        evaluadoId: data.evaluadoId,
        planId: null,
        tipoMonitoreo: data.tipoMonitoreo,
        numeroVisita: data.numeroVisita,
        fechaProgramada: new Date(data.fechaProgramada),
        horaInicio: data.horaInicio,
        detalles: data.detalles,
        estado: 'PROGRAMADO',
        modalidad: data.modalidad,
        nivelEducativo: data.nivelEducativo,
        creadoPorId: data.creadoPorId,
      },
    });
    return this.mapVisita(row);
  }

  async update(id: string, data: UpdateVisitaData): Promise<IVisita> {
    const updateData: any = {};
    if (data.fechaProgramada) updateData.fechaProgramada = new Date(data.fechaProgramada);
    if (data.horaInicio) updateData.horaInicio = data.horaInicio;
    if (data.detalles !== undefined) updateData.detalles = data.detalles;
    if (data.estado) updateData.estado = data.estado;
    const row = await this.prisma.cronograma.update({ where: { id }, data: updateData });
    return this.mapVisita(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.cronograma.delete({ where: { id } });
  }

  async findMonitorEspecialidades(
    monitorId: string,
  ): Promise<Array<{ especialidad: { nombre: string } }>> {
    return this.prisma.especialistaEspecialidad.findMany({
      where: { especialistaId: monitorId },
      include: { especialidad: { select: { nombre: true } } },
    }) as unknown as Array<{ especialidad: { nombre: string } }>;
  }

  async applyReprogramacion(
    cronogramaId: string,
    fechaProgramada: Date,
    horaInicio: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.$executeRawUnsafe(
        `SELECT set_config('app.reprogramacion_apply', 'true', true)`,
      ),
      this.prisma.cronograma.update({
        where: { id: cronogramaId },
        data: {
          fechaProgramada,
          horaInicio,
          estado: 'REPROGRAMADO',
        },
      }),
    ]);
  }
}

@Injectable()
export class PrismaSolicitudReprogramacionRepository implements SolicitudReprogramacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapSolicitud(s: any): ISolicitudReprogramacion {
    return fromPrismaSolicitud(s);
  }

  async findAll(filters?: any): Promise<ISolicitudReprogramacion[]> {
    const where: any = {};
    if (filters) {
      if (filters.cronogramaId) where.cronogramaId = filters.cronogramaId;
      if (filters.solicitanteId) where.solicitanteId = filters.solicitanteId;
      if (filters.estado) where.estado = filters.estado;
    }
    const rows = await this.prisma.solicitudReprogramacion.findMany({
      where,
      include: {
        resueltoPor: {
          include: {
            persona: true,
            rol: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapSolicitud(r));
  }

  async findById(id: string): Promise<ISolicitudReprogramacion | null> {
    const row = await this.prisma.solicitudReprogramacion.findUnique({
      where: { id },
      include: {
        resueltoPor: {
          include: {
            persona: true,
            rol: true,
          },
        },
      },
    });
    return row ? this.mapSolicitud(row) : null;
  }

  async findPendienteByCronograma(cronogramaId: string): Promise<ISolicitudReprogramacion | null> {
    const row = await this.prisma.solicitudReprogramacion.findFirst({
      where: { cronogramaId, estado: 'PENDIENTE' },
      include: {
        resueltoPor: {
          include: {
            persona: true,
            rol: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.mapSolicitud(row) : null;
  }

  async create(data: CreateSolicitudData): Promise<ISolicitudReprogramacion> {
    const row = await this.prisma.solicitudReprogramacion.create({
      data: {
        cronogramaId: data.cronogramaId,
        solicitanteId: data.solicitanteId,
        solicitanteRolAlCrear: data.solicitanteRolAlCrear,
        fechaOriginal: new Date(data.fechaOriginal),
        horaOriginal: data.horaOriginal,
        fechaPropuesta: new Date(data.fechaPropuesta),
        horaPropuesta: data.horaPropuesta,
        justificacion: data.justificacion,
        archivoSustentoUrl: data.archivoSustentoUrl,
        estado: 'PENDIENTE',
      },
    });
    return this.mapSolicitud(row);
  }

  async resolver(id: string, data: ResolverSolicitudData): Promise<ISolicitudReprogramacion> {
    const row = await this.prisma.solicitudReprogramacion.update({
      where: { id },
      data: {
        estado: data.estado,
        resueltoPorId: data.resueltoPorId,
        comentarioResolucion: data.comentarioResolucion,
        fechaResolucion: new Date(),
      },
      include: {
        resueltoPor: {
          include: {
            persona: true,
            rol: true,
          },
        },
      },
    });
    return this.mapSolicitud(row);
  }
}
