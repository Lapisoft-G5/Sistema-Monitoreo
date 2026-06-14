import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { InstitutionsRepository } from './institutions.repository.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { EstadoInstitucion } from '../../../common/enums/estado.enum.js';

@Injectable()
export class PrismaInstitutionsRepository implements InstitutionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeDocenteDirector = {
    docentes: {
      include: {
        persona: true,
        docenteCargos: {
          include: {
            cargo: true,
          },
        },
      },
    },
  };

  private mapInstitucion(record: any): Institucion {
    if (!record) return record;
    // Buscar un docente con el cargo activo de "Director"
    const directorDocente = record.docentes?.find((d: any) =>
      d.docenteCargos?.some((dc: any) => dc.cargo?.nombre === 'Director' && !dc.fechaFin),
    );

    const directorName = directorDocente
      ? `${directorDocente.persona.nombres} ${directorDocente.persona.apellidos}`.trim()
      : null;
    const directorPhone = directorDocente?.persona?.telefono || null;
    const directorEmail = directorDocente?.persona?.correo || null;

    return {
      id: record.id,
      codigoModular: record.codigoModular,
      codigoLocal: record.codigoLocal,
      nombre: record.nombre,
      nivelEducativo: record.nivelEducativo,
      departamento: record.departamento,
      provincia: record.provincia,
      distrito: record.distrito,
      direccion: record.direccion,
      zona: record.zona,
      estado: record.estado,
      modalidad: record.modalidad,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      director: directorName,
      directorTelefono: directorPhone,
      directorCorreo: directorEmail,
      directorDni: directorDocente?.persona?.dni || null,
    };
  }

  private async assignDirector(institucionId: string, directorDni?: string | null): Promise<void> {
    const now = new Date();

    // 1. Obtener la I.E. con su director actual
    const currentInst = await this.prisma.institucionEducativa.findUnique({
      where: { id: institucionId },
      include: this.includeDocenteDirector,
    });

    // Encontrar un docente con el cargo activo de "Director"
    const currentDirectorDocente = currentInst?.docentes?.find((d: any) =>
      d.docenteCargos?.some((dc: any) => dc.cargo?.nombre === 'Director' && !dc.fechaFin),
    ) || null;

    // 2. Obtener el catálogo del cargo 'Director'
    const directorCargo = await this.prisma.cargo.findFirst({
      where: { nombre: 'Director' },
    });

    if (!directorCargo) {
      return; // Si no existe el catálogo, no procedemos
    }

    if (directorDni) {
      // Buscar la persona y su relación como docente
      const newDirectorPersona = await this.prisma.persona.findUnique({
        where: { dni: directorDni },
        include: { docente: true },
      });

      const newDirectorDocente = newDirectorPersona?.docente || null;

      if (!newDirectorPersona || !newDirectorDocente) {
        throw new BadRequestException(`No se encontró un docente registrado con el DNI ${directorDni}`);
      }

      // Validar si ya es director activo de otra institución
      const activeDirectorCargo = await this.prisma.docenteCargo.findFirst({
        where: {
          docenteId: newDirectorDocente.id,
          cargo: { nombre: 'Director' },
          fechaFin: null,
        },
        include: {
          docente: {
            include: {
              institucion: true,
            },
          },
        },
      });

      if (activeDirectorCargo && activeDirectorCargo.docente.institucionId !== institucionId) {
        const schoolName = activeDirectorCargo.docente.institucion?.nombre || 'otra institución';
        throw new ConflictException(
          `El docente ya es director activo en la I.E. "${schoolName}".`
        );
      }

      // Si es el mismo director, no hacemos cambios
      if (currentDirectorDocente && currentDirectorDocente.id === newDirectorDocente.id) {
        return;
      }

      // Si había un director anterior, finalizamos su cargo activo
      if (currentDirectorDocente) {
        await this.prisma.docenteCargo.updateMany({
          where: {
            docenteId: currentDirectorDocente.id,
            cargo: {
              nombre: {
                in: ['Director', 'Coordinador Pedagógico'],
              },
            },
            fechaFin: null,
          },
          data: {
            fechaFin: now,
          },
        });

        // Sincronizar rol del director anterior a 'docente'
        const docenteRole = await this.prisma.role.findUnique({
          where: { codigo: 'docente' },
        });
        if (docenteRole) {
          await this.prisma.usuario.updateMany({
            where: { personaId: currentDirectorDocente.personaId },
            data: { rolId: docenteRole.id },
          });
        }
      }

      // Vinculamos al nuevo docente con la institución
      await this.prisma.docente.update({
        where: { id: newDirectorDocente.id },
        data: { institucionId },
      });

      // Finalizamos cualquier cargo activo que tenga el nuevo director actualmente
      await this.prisma.docenteCargo.updateMany({
        where: {
          docenteId: newDirectorDocente.id,
          fechaFin: null,
        },
        data: {
          fechaFin: now,
        },
      });

      // Asignamos el cargo de director activo al nuevo docente
      await this.prisma.docenteCargo.create({
        data: {
          docenteId: newDirectorDocente.id,
          cargoId: directorCargo.id,
          fechaInicio: now,
        },
      });

      // Sincronizar rol del nuevo director a 'director_institucion'
      const directorRole = await this.prisma.role.findUnique({
        where: { codigo: 'director_institucion' },
      });
      if (directorRole) {
        await this.prisma.usuario.updateMany({
          where: { personaId: newDirectorPersona.id },
          data: { rolId: directorRole.id },
        });
      }
    } else {
      // Si el DNI es explícitamente nulo (limpiar director)
      if (currentDirectorDocente) {
        await this.prisma.docenteCargo.updateMany({
          where: {
            docenteId: currentDirectorDocente.id,
            cargo: {
              nombre: {
                in: ['Director', 'Coordinador Pedagógico'],
              },
            },
            fechaFin: null,
          },
          data: {
            fechaFin: now,
          },
        });

        // Sincronizar rol del director anterior a 'docente'
        const docenteRole = await this.prisma.role.findUnique({
          where: { codigo: 'docente' },
        });
        if (docenteRole) {
          await this.prisma.usuario.updateMany({
            where: { personaId: currentDirectorDocente.personaId },
            data: { rolId: docenteRole.id },
          });
        }
      }
    }
  }

  async create(data: CreateInstitucionDto): Promise<Institucion> {
    const { directorDni, ...createData } = data;
    const record = await this.prisma.institucionEducativa.create({
      data: {
        codigoModular: createData.codigoModular,
        codigoLocal: createData.codigoLocal,
        nombre: createData.nombre,
        nivelEducativo: createData.nivelEducativo,
        departamento: createData.departamento ?? 'Puno',
        provincia: createData.provincia,
        distrito: createData.distrito,
        direccion: createData.direccion,
        zona: createData.zona,
        estado: createData.estado ?? EstadoInstitucion.ACTIVA,
        modalidad: createData.modalidad,
      },
      include: this.includeDocenteDirector,
    });

    if (directorDni) {
      await this.assignDirector(record.id, directorDni);
    }

    const reloaded = await this.prisma.institucionEducativa.findUnique({
      where: { id: record.id },
      include: this.includeDocenteDirector,
    });

    return this.mapInstitucion(reloaded || record);
  }

  async findById(id: string): Promise<Institucion | null> {
    const record = await this.prisma.institucionEducativa.findUnique({
      where: { id },
      include: this.includeDocenteDirector,
    });
    if (!record) return null;
    return this.mapInstitucion(record);
  }

  async findByCodigoModular(codigoModular: string): Promise<Institucion | null> {
    const record = await this.prisma.institucionEducativa.findUnique({
      where: { codigoModular },
      include: this.includeDocenteDirector,
    });
    if (!record) return null;
    return this.mapInstitucion(record);
  }

  async update(id: string, data: UpdateInstitucionDto): Promise<Institucion> {
    const { directorDni, ...updateData } = data;

    if (directorDni !== undefined) {
      await this.assignDirector(id, directorDni);
    }

    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: updateData,
      include: this.includeDocenteDirector,
    });
    return this.mapInstitucion(record);
  }

  async softDelete(id: string): Promise<Institucion> {
    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: { estado: EstadoInstitucion.INACTIVA },
      include: this.includeDocenteDirector,
    });
    return this.mapInstitucion(record);
  }

  async restore(id: string): Promise<Institucion> {
    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: { estado: EstadoInstitucion.ACTIVA },
      include: this.includeDocenteDirector,
    });
    return this.mapInstitucion(record);
  }

  async findAll(query: QueryInstitucionDto): Promise<{ data: Institucion[]; total: number }> {
    const { nombre, nivelEducativo, estado, limit = 10, offset = 0 } = query;
    const where: Prisma.InstitucionEducativaWhereInput = {};

    if (nombre) {
      where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (nivelEducativo) {
      where.nivelEducativo = { contains: nivelEducativo, mode: 'insensitive' };
    }
    if (estado) {
      where.estado = { equals: estado };
    }
    if (query.modalidad) {
      where.modalidad = { equals: query.modalidad };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.institucionEducativa.findMany({
        where,
        take: limit,
        skip: offset,
        include: this.includeDocenteDirector,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.institucionEducativa.count({ where }),
    ]);

    return {
      data: data.map((record) => this.mapInstitucion(record)),
      total,
    };
  }
}
