/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  IFichaMonitoreo,
  IFichaContexto,
  IFichaRespuestaDesempeno,
  IFichaRespuestaAspecto,
  NivelLogro,
} from '@sistema-monitoreo/shared-contracts';
import {
  FichaRepository,
  CreateFichaData,
  SaveRespuestaData,
  SaveRespuestaAspectoData,
} from './ficha.repository.js';

@Injectable()
export class PrismaFichaRepository implements FichaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapContexto(c: any): IFichaContexto {
    return {
      id: c.id,
      areaCurricular: c.areaCurricular,
      grado: c.grado,
      seccion: c.seccion,
      cantidadEstudiantes: c.cantidadEstudiantes,
      cantidadEstudiantesNee: c.cantidadEstudiantesNee,
      cursoId: c.cursoId,
    };
  }

  private async buildFicha(fichaId: string): Promise<IFichaMonitoreo> {
    const ficha = await this.prisma.fichaMonitoreo.findUnique({
      where: { id: fichaId },
      include: {
        fichaContexto: true,
        respuestasDesempeno: true,
        respuestasAspecto: true,
        plantilla: { select: { id: true, version: true, estado: true } },
      },
    });
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);

    const requiereMigracion = ficha.plantilla?.estado === 'Historico';

    return {
      id: ficha.id,
      cronogramaId: ficha.cronogramaId,
      plantillaId: ficha.plantillaId,
      plantillaVersion: ficha.plantilla?.version ?? 0,
      fichaContextoId: ficha.fichaContextoId,
      anioAcademico: ficha.anioAcademico,
      puntajeTotal: ficha.puntajeTotal,
      promedio: Number(ficha.promedio),
      nivelLogro: ficha.nivelLogro as any,
      estado: ficha.estado as any,
      contexto: this.mapContexto(ficha.fichaContexto),
      respuestasDesempeno: ficha.respuestasDesempeno.map((r) => ({
        id: r.id,
        fichaId: r.fichaId,
        desempenoId: r.desempenoId,
        nivel: r.nivel,
        observaciones: r.observaciones,
      })),
      respuestasAspecto: ficha.respuestasAspecto.map((r) => ({
        id: r.id,
        fichaId: r.fichaId,
        aspectoId: r.aspectoId,
        marcado: r.marcado,
      })),
      creadoPorId: ficha.creadoPorId,
      finalizadaPorId: ficha.finalizadaPorId,
      observaciones: ficha.observaciones,
      sugerencias: (ficha as any).sugerencias || null,
      compromisos: (ficha as any).compromisos || null,
      requiereMigracion,
      plantillaHistoricaId: requiereMigracion ? ficha.plantillaId : null,
      createdAt: ficha.createdAt.toISOString(),
      finalizadaAt: ficha.finalizadaAt ? ficha.finalizadaAt.toISOString() : null,
    };
  }

  async findByVisitaId(cronogramaId: string): Promise<IFichaMonitoreo | null> {
    const ficha = await this.prisma.fichaMonitoreo.findUnique({
      where: { cronogramaId },
    });
    if (!ficha) return null;
    return this.buildFicha(ficha.id);
  }

  async findById(id: string): Promise<IFichaMonitoreo | null> {
    const ficha = await this.prisma.fichaMonitoreo.findUnique({ where: { id } });
    if (!ficha) return null;
    return this.buildFicha(id);
  }

  async create(data: CreateFichaData): Promise<IFichaMonitoreo> {
    const id = randomUUID();
    const contextoId = randomUUID();
    await this.prisma.fichaContexto.create({
      data: {
        id: contextoId,
        areaCurricular: data.contexto.areaCurricular,
        grado: data.contexto.grado,
        seccion: data.contexto.seccion,
        cantidadEstudiantes: data.contexto.cantidadEstudiantes,
        cantidadEstudiantesNee: data.contexto.cantidadEstudiantesNee,
        cursoId: data.contexto.cursoId,
      },
    });
    await this.prisma.fichaMonitoreo.create({
      data: {
        id,
        cronogramaId: data.cronogramaId,
        plantillaId: data.plantillaId,
        fichaContextoId: contextoId,
        anioAcademico: data.anioAcademico,
        puntajeTotal: 0,
        promedio: 1,
        nivelLogro: 'INICIO',
        estado: 'BORRADOR',
        creadoPorId: data.creadoPorId,
      },
    });
    return this.buildFicha(id);
  }

  async saveRespuestaDesempeno(data: SaveRespuestaData): Promise<IFichaRespuestaDesempeno> {
    const existing = await this.prisma.fichaRespuestaDesempeno.findFirst({
      where: { fichaId: data.fichaId, desempenoId: data.desempenoId },
    });
    if (existing) {
      const updated = await this.prisma.fichaRespuestaDesempeno.update({
        where: { id: existing.id },
        data: {
          nivel: data.nivel,
          observaciones: data.observaciones !== undefined ? data.observaciones : undefined,
        },
      });
      return {
        id: updated.id,
        fichaId: updated.fichaId,
        desempenoId: updated.desempenoId,
        nivel: updated.nivel,
        observaciones: updated.observaciones,
      };
    }
    const created = await this.prisma.fichaRespuestaDesempeno.create({
      data: {
        id: randomUUID(),
        fichaId: data.fichaId,
        desempenoId: data.desempenoId,
        nivel: data.nivel,
        observaciones: data.observaciones ?? null,
      },
    });
    return {
      id: created.id,
      fichaId: created.fichaId,
      desempenoId: created.desempenoId,
      nivel: created.nivel,
      observaciones: created.observaciones,
    };
  }

  async saveRespuestaAspecto(data: SaveRespuestaAspectoData): Promise<IFichaRespuestaAspecto> {
    const existing = await this.prisma.fichaRespuestaAspecto.findFirst({
      where: { fichaId: data.fichaId, aspectoId: data.aspectoId },
    });
    if (existing) {
      const updated = await this.prisma.fichaRespuestaAspecto.update({
        where: { id: existing.id },
        data: { marcado: data.marcado },
      });
      return {
        id: updated.id,
        fichaId: updated.fichaId,
        aspectoId: updated.aspectoId,
        marcado: updated.marcado,
      };
    }
    const created = await this.prisma.fichaRespuestaAspecto.create({
      data: {
        id: randomUUID(),
        fichaId: data.fichaId,
        aspectoId: data.aspectoId,
        marcado: data.marcado,
      },
    });
    return {
      id: created.id,
      fichaId: created.fichaId,
      aspectoId: created.aspectoId,
      marcado: created.marcado,
    };
  }

  async finalizar(
    fichaId: string,
    puntajeTotal: number,
    promedio: number,
    nivelLogro: NivelLogro,
    finalizadaPorId: string,
    observaciones?: string,
    sugerencias?: string,
    compromisos?: string,
  ): Promise<IFichaMonitoreo> {
    await this.prisma.fichaMonitoreo.update({
      where: { id: fichaId },
      data: {
        puntajeTotal,
        promedio,
        nivelLogro,
        estado: 'FINALIZADO',
        finalizadaPorId,
        finalizadaAt: new Date(),
        observaciones,
        sugerencias,
        compromisos,
      },
    });
    return this.buildFicha(fichaId);
  }

  async plantillaEstaHistorica(plantillaId: string): Promise<boolean> {
    const p = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: plantillaId },
      select: { estado: true },
    });
    return p?.estado === 'Historico';
  }
}
