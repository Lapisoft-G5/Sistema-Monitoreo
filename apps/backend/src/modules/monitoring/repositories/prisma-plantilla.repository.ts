/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IPlantilla } from '@sistema-monitoreo/shared-contracts';
import {
  CreatePlantillaData,
  PlantillaRepository,
  UpdatePlantillaData,
} from './plantilla.repository.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PrismaPlantillaRepository implements PlantillaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async buildPlantilla(plantillaId: string): Promise<IPlantilla> {
    const plantilla = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: plantillaId },
      include: {
        nivelesCalificacion: { orderBy: { orden: 'asc' } },
        desempenos: {
          orderBy: { orden: 'asc' },
          include: {
            aspectos: { orderBy: { orden: 'asc' } },
            rubrica: true,
          },
        },
      },
    });
    if (!plantilla) {
      throw new NotFoundException(`Plantilla ${plantillaId} no encontrada.`);
    }
    return {
      id: plantilla.id,
      tipoMonitoreo: plantilla.tipoMonitoreo as 'DOCENTE' | 'DIRECTIVO',
      anioAcademico: plantilla.anioAcademico,
      version: plantilla.version,
      baremo: plantilla.baremo as 'Vigente' | 'Porcentual',
      descripcion: plantilla.descripcion,
      estado: plantilla.estado as 'Borrador' | 'Vigente' | 'Historico',
      autorId: plantilla.autorId,
      rolAutorAlCrear: plantilla.rolAutorAlCrear as 'jefe_gestion' | 'director_institucion',
      institucionId: plantilla.institucionId,
      niveles: plantilla.nivelesCalificacion.map((n) => ({
        id: n.id,
        plantillaId: n.plantillaId,
        nivelRomano: n.nivelRomano as 'I' | 'II' | 'III' | 'IV',
        denominacion: n.denominacion,
        rangoMin: n.rangoMin,
        color: n.color,
        orden: n.orden,
      })),
      desempenos: plantilla.desempenos.map((d) => ({
        id: d.id,
        plantillaId: d.plantillaId,
        nombre: d.nombre,
        descripcionCorta: d.descripcionCorta,
        orden: d.orden,
        aspectos: d.aspectos.map((a) => ({
          id: a.id,
          desempenoId: a.desempenoId,
          descripcion: a.descripcion,
          orden: a.orden,
        })),
        rubrica: d.rubrica.map((r) => ({
          id: r.id,
          desempenoId: r.desempenoId,
          nivelCalificacionId: r.nivelCalificacionId,
          nivelRomano: d.rubrica.find((x) => x.id === r.id)
            ? (d.rubrica.find((x) => x.id === r.id) as any).nivelRomano
            : ('I' as any),
          descripcion: r.descripcion,
        })),
      })),
      createdAt: plantilla.createdAt.toISOString(),
      updatedAt: plantilla.updatedAt.toISOString(),
    };
  }

  private async syncArbol(plantillaId: string, niveles: any[], desempenos: any[]): Promise<void> {
    // Niveles: como son 4 fijos (I-IV), se hace upsert por nivel
    for (const n of niveles) {
      const existing = await this.prisma.nivelCalificacion.findFirst({
        where: { plantillaId, nivelRomano: n.nivelRomano },
      });
      if (existing) {
        await this.prisma.nivelCalificacion.update({
          where: { id: existing.id },
          data: {
            denominacion: n.denominacion,
            rangoMin: n.rangoMin,
            color: n.color,
            orden: n.orden,
          },
        });
      } else {
        await this.prisma.nivelCalificacion.create({
          data: {
            id: randomUUID(),
            plantillaId,
            nivelRomano: n.nivelRomano,
            denominacion: n.denominacion,
            rangoMin: n.rangoMin,
            color: n.color,
            orden: n.orden,
          },
        });
      }
    }

    // Desempenos: diff por ID (los clientes generan los UUIDs)
    const desempenosActuales = await this.prisma.desempenoPlantilla.findMany({
      where: { plantillaId },
    });
    const idsActuales = new Set(desempenosActuales.map((d) => d.id));
    const idsNuevos = new Set(desempenos.map((d) => d.id));

    // Eliminar desempenos que ya no estan (cascade a sus hijos)
    for (const actual of desempenosActuales) {
      if (!idsNuevos.has(actual.id)) {
        await this.prisma.desempenoPlantilla.delete({ where: { id: actual.id } });
      }
    }

    for (const d of desempenos) {
      const desempeno = idsActuales.has(d.id)
        ? await this.prisma.desempenoPlantilla.update({
            where: { id: d.id },
            data: {
              nombre: d.nombre,
              descripcionCorta: d.descripcionCorta,
              orden: d.orden,
            },
          })
        : await this.prisma.desempenoPlantilla.create({
            data: {
              id: d.id,
              plantillaId,
              nombre: d.nombre,
              descripcionCorta: d.descripcionCorta,
              orden: d.orden,
            },
          });

      // Aspectos del desempeno
      const aspectosActuales = await this.prisma.aspectoEvaluado.findMany({
        where: { desempenoId: desempeno.id },
      });
      const idsAspectosActuales = new Set(aspectosActuales.map((a) => a.id));
      const idsAspectosNuevos = new Set(d.aspectos.map((a: any) => a.id));
      for (const actual of aspectosActuales) {
        if (!idsAspectosNuevos.has(actual.id)) {
          await this.prisma.aspectoEvaluado.delete({ where: { id: actual.id } });
        }
      }
      for (const a of d.aspectos) {
        if (idsAspectosActuales.has(a.id)) {
          await this.prisma.aspectoEvaluado.update({
            where: { id: a.id },
            data: { descripcion: a.descripcion, orden: a.orden },
          });
        } else {
          await this.prisma.aspectoEvaluado.create({
            data: {
              id: a.id,
              desempenoId: desempeno.id,
              descripcion: a.descripcion,
              orden: a.orden,
            },
          });
        }
      }

      // Rubrica: una entrada por nivel
      for (const r of d.rubrica) {
        const nivel = await this.prisma.nivelCalificacion.findFirst({
          where: { plantillaId, nivelRomano: r.nivelRomano },
        });
        if (!nivel) continue;
        await this.prisma.rubricaNivel.upsert({
          where: {
            desempenoId_nivelCalificacionId: {
              desempenoId: desempeno.id,
              nivelCalificacionId: nivel.id,
            },
          },
          update: { descripcion: r.descripcion },
          create: {
            desempenoId: desempeno.id,
            nivelCalificacionId: nivel.id,
            descripcion: r.descripcion,
          },
        });
      }
    }
  }

  async findAll(filters?: any): Promise<IPlantilla[]> {
    const where: any = { deleted: false };
    if (filters) {
      if (filters.search) {
        where.descripcion = { contains: filters.search, mode: 'insensitive' };
      }
      if (filters.anioAcademico !== undefined) where.anioAcademico = filters.anioAcademico;
      if (filters.tipoMonitoreo) where.tipoMonitoreo = filters.tipoMonitoreo;
      if (filters.estado) where.estado = filters.estado;
    }
    const plantillas = await this.prisma.plantillaMonitoreo.findMany({
      where,
      orderBy: [{ anioAcademico: 'desc' }, { version: 'desc' }, { createdAt: 'desc' }],
    });
    return Promise.all(plantillas.map((p) => this.buildPlantilla(p.id)));
  }

  async findById(id: string): Promise<IPlantilla | null> {
    const exists = await this.prisma.plantillaMonitoreo.findUnique({ where: { id } });
    if (!exists) return null;
    return this.buildPlantilla(id);
  }

  async countFichasAsociadas(plantillaId: string): Promise<number> {
    return this.prisma.fichaMonitoreo.count({ where: { plantillaId } });
  }

  async create(data: CreatePlantillaData): Promise<IPlantilla> {
    const id = randomUUID();
    await this.prisma.plantillaMonitoreo.create({
      data: {
        id,
        tipoMonitoreo: data.data.tipoMonitoreo,
        anioAcademico: data.data.anioAcademico,
        version: 1,
        baremo: data.data.baremo,
        descripcion: data.data.descripcion,
        estado: 'Borrador',
        autorId: data.autorId,
        rolAutorAlCrear: data.rolAutorAlCrear,
        institucionId: data.institucionId,
        deleted: false,
      },
    });
    await this.syncArbol(id, data.data.niveles, data.data.desempenos);
    return this.buildPlantilla(id);
  }

  async updateInPlace(plantillaId: string, data: UpdatePlantillaData): Promise<IPlantilla> {
    const updateData: any = {};
    if (data.data.baremo !== undefined) updateData.baremo = data.data.baremo;
    if (data.data.descripcion !== undefined) updateData.descripcion = data.data.descripcion;
    if (Object.keys(updateData).length > 0) {
      await this.prisma.plantillaMonitoreo.update({
        where: { id: plantillaId },
        data: updateData,
      });
    }
    if (data.data.niveles || data.data.desempenos) {
      const nivelesActuales = data.data.niveles
        ? data.data.niveles
        : (
            await this.prisma.nivelCalificacion.findMany({
              where: { plantillaId },
              orderBy: { orden: 'asc' },
            })
          ).map((n) => ({
            nivelRomano: n.nivelRomano,
            denominacion: n.denominacion,
            rangoMin: n.rangoMin,
            color: n.color,
            orden: n.orden,
          }));
      const desempenosActuales = data.data.desempenos ? data.data.desempenos : [];
      if (data.data.desempenos) {
        await this.syncArbol(plantillaId, nivelesActuales, desempenosActuales);
      } else {
        // Solo syncronizar niveles
        for (const n of nivelesActuales as any[]) {
          const existing = await this.prisma.nivelCalificacion.findFirst({
            where: { plantillaId, nivelRomano: n.nivelRomano },
          });
          if (existing) {
            await this.prisma.nivelCalificacion.update({
              where: { id: existing.id },
              data: {
                denominacion: n.denominacion,
                rangoMin: n.rangoMin,
                color: n.color,
                orden: n.orden,
              },
            });
          }
        }
      }
    }
    return this.buildPlantilla(plantillaId);
  }

  async versionarConClon(
    plantillaOriginalId: string,
    data: UpdatePlantillaData,
    nuevoAutorId: string,
  ): Promise<IPlantilla> {
    const original = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: plantillaOriginalId },
      include: {
        nivelesCalificacion: { orderBy: { orden: 'asc' } },
        desempenos: {
          orderBy: { orden: 'asc' },
          include: {
            aspectos: { orderBy: { orden: 'asc' } },
            rubrica: true,
          },
        },
      },
    });
    if (!original) {
      throw new NotFoundException(`Plantilla original ${plantillaOriginalId} no encontrada.`);
    }

    const maxVersion = await this.prisma.plantillaMonitoreo.aggregate({
      where: {
        tipoMonitoreo: original.tipoMonitoreo,
        anioAcademico: original.anioAcademico,
      },
      _max: { version: true },
    });
    const nuevaVersion = (maxVersion._max.version ?? 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      // 1. Marcar original como Historico y soft-deleted
      await tx.plantillaMonitoreo.update({
        where: { id: original.id },
        data: { estado: 'Historico', deleted: true },
      });

      // 2. Crear nuevo clon
      const nuevoId = randomUUID();
      await tx.plantillaMonitoreo.create({
        data: {
          id: nuevoId,
          tipoMonitoreo: original.tipoMonitoreo,
          anioAcademico: original.anioAcademico,
          version: nuevaVersion,
          baremo: data.data.baremo ?? original.baremo,
          descripcion: data.data.descripcion ?? original.descripcion,
          estado: 'Borrador',
          autorId: nuevoAutorId,
          rolAutorAlCrear: original.rolAutorAlCrear,
          institucionId: original.institucionId,
          deleted: false,
        },
      });

      // 3. Clonar niveles (con nuevo UUID)
      const nivelesClonados: Record<string, string> = {};
      for (const n of original.nivelesCalificacion) {
        const newUuid = randomUUID();
        nivelesClonados[n.id] = newUuid;
        await tx.nivelCalificacion.create({
          data: {
            id: newUuid,
            plantillaId: nuevoId,
            nivelRomano: n.nivelRomano,
            denominacion: n.denominacion,
            rangoMin: n.rangoMin,
            color: n.color,
            orden: n.orden,
          },
        });
      }

      // 4. Clonar desempenos, aspectos y rubrica
      // Si vienen desempenos nuevos en data, los usamos; sino clonamos los existentes
      const desempenosFinales = data.data.desempenos
        ? data.data.desempenos
        : original.desempenos.map((d) => ({
            id: d.id, // preservamos el id del cliente
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            orden: d.orden,
            aspectos: d.aspectos.map((a) => ({
              id: a.id,
              descripcion: a.descripcion,
              orden: a.orden,
            })),
            rubrica: d.rubrica.map((r) => {
              const nivelOriginal = original.nivelesCalificacion.find(
                (n) => n.id === r.nivelCalificacionId,
              );
              return {
                nivelRomano: nivelOriginal?.nivelRomano ?? 'I',
                descripcion: r.descripcion,
              };
            }),
          }));

      for (const d of desempenosFinales) {
        await tx.desempenoPlantilla.create({
          data: {
            id: d.id,
            plantillaId: nuevoId,
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            orden: d.orden,
            aspectos: {
              create: d.aspectos.map((a) => ({
                id: a.id,
                descripcion: a.descripcion,
                orden: a.orden,
              })),
            },
            rubrica: {
              create: d.rubrica.map((r) => {
                const nivelNuevo = original.nivelesCalificacion.find(
                  (n) => n.nivelRomano === r.nivelRomano,
                );
                return {
                  nivelCalificacionId: nivelNuevo
                    ? nivelesClonados[nivelNuevo.id]
                    : Object.values(nivelesClonados)[0],
                  descripcion: r.descripcion,
                };
              }),
            },
          },
        });
      }

      // 4. Devolver la nueva plantilla
      const creada = await tx.plantillaMonitoreo.findUnique({
        where: { id: nuevoId },
        include: {
          nivelesCalificacion: { orderBy: { orden: 'asc' } },
          desempenos: {
            orderBy: { orden: 'asc' },
            include: {
              aspectos: { orderBy: { orden: 'asc' } },
              rubrica: true,
            },
          },
        },
      });
      if (!creada) throw new NotFoundException('Error creando nueva version.');
      return {
        id: creada.id,
        tipoMonitoreo: creada.tipoMonitoreo as 'DOCENTE' | 'DIRECTIVO',
        anioAcademico: creada.anioAcademico,
        version: creada.version,
        baremo: creada.baremo as 'Vigente' | 'Porcentual',
        descripcion: creada.descripcion,
        estado: creada.estado as 'Borrador' | 'Vigente' | 'Historico',
        autorId: creada.autorId,
        rolAutorAlCrear: creada.rolAutorAlCrear as 'jefe_gestion' | 'director_institucion',
        institucionId: creada.institucionId,
        niveles: creada.nivelesCalificacion.map((n) => ({
          id: n.id,
          plantillaId: n.plantillaId,
          nivelRomano: n.nivelRomano as 'I' | 'II' | 'III' | 'IV',
          denominacion: n.denominacion,
          rangoMin: n.rangoMin,
          color: n.color,
          orden: n.orden,
        })),
        desempenos: creada.desempenos.map((dp) => ({
          id: dp.id,
          plantillaId: dp.plantillaId,
          nombre: dp.nombre,
          descripcionCorta: dp.descripcionCorta,
          orden: dp.orden,
          aspectos: dp.aspectos.map((a) => ({
            id: a.id,
            desempenoId: a.desempenoId,
            descripcion: a.descripcion,
            orden: a.orden,
          })),
          rubrica: dp.rubrica.map((r) => ({
            id: r.id,
            desempenoId: r.desempenoId,
            nivelCalificacionId: r.nivelCalificacionId,
            nivelRomano: 'I' as any,
            descripcion: r.descripcion,
          })),
        })),
        createdAt: creada.createdAt.toISOString(),
        updatedAt: creada.updatedAt.toISOString(),
      };
    });
  }

  async updateEstado(
    id: string,
    estado: 'Borrador' | 'Vigente' | 'Historico',
  ): Promise<IPlantilla> {
    const exists = await this.prisma.plantillaMonitoreo.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    await this.prisma.plantillaMonitoreo.update({ where: { id }, data: { estado } });
    return this.buildPlantilla(id);
  }

  async clone(
    sourceId: string,
    nuevoAutorId: string,
    rolAutorAlCrear: 'jefe_gestion' | 'director_institucion',
    institucionId: string | null,
    descripcion?: string,
  ): Promise<IPlantilla> {
    const original = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: sourceId },
      include: {
        nivelesCalificacion: { orderBy: { orden: 'asc' } },
        desempenos: {
          orderBy: { orden: 'asc' },
          include: {
            aspectos: { orderBy: { orden: 'asc' } },
            rubrica: true,
          },
        },
      },
    });
    if (!original) throw new NotFoundException(`Plantilla origen ${sourceId} no encontrada.`);

    const nuevoId = randomUUID();
    await this.prisma.plantillaMonitoreo.create({
      data: {
        id: nuevoId,
        tipoMonitoreo: original.tipoMonitoreo,
        anioAcademico: new Date().getFullYear(),
        version: 1,
        baremo: original.baremo,
        descripcion:
          descripcion ??
          `Copia basada en ${original.tipoMonitoreo} ${original.anioAcademico} v${original.version}.`,
        estado: 'Borrador',
        autorId: nuevoAutorId,
        rolAutorAlCrear,
        institucionId,
        deleted: false,
      },
    });

    for (const n of original.nivelesCalificacion) {
      await this.prisma.nivelCalificacion.create({
        data: {
          id: randomUUID(),
          plantillaId: nuevoId,
          nivelRomano: n.nivelRomano,
          denominacion: n.denominacion,
          rangoMin: n.rangoMin,
          color: n.color,
          orden: n.orden,
        },
      });
    }

    const nuevosNiveles = await this.prisma.nivelCalificacion.findMany({
      where: { plantillaId: nuevoId },
    });
    const mapNiveles: Record<string, string> = {};
    for (const o of original.nivelesCalificacion) {
      const n = nuevosNiveles.find((x) => x.nivelRomano === o.nivelRomano);
      if (n) mapNiveles[o.id] = n.id;
    }

    for (const d of original.desempenos) {
      await this.prisma.desempenoPlantilla.create({
        data: {
          id: randomUUID(),
          plantillaId: nuevoId,
          nombre: d.nombre,
          descripcionCorta: d.descripcionCorta,
          orden: d.orden,
          aspectos: {
            create: d.aspectos.map((a) => ({
              id: randomUUID(),
              descripcion: a.descripcion,
              orden: a.orden,
            })),
          },
          rubrica: {
            create: d.rubrica.map((r) => ({
              nivelCalificacionId: mapNiveles[r.nivelCalificacionId] ?? nuevosNiveles[0].id,
              descripcion: r.descripcion,
            })),
          },
        },
      });
    }

    return this.buildPlantilla(nuevoId);
  }
}
