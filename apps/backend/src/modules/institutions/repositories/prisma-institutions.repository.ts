import { Injectable } from '@nestjs/common';
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
      const directorPersona = await this.prisma.persona.findUnique({
        where: { dni: directorDni },
      });
      if (directorPersona) {
        await this.prisma.docente.update({
          where: { personaId: directorPersona.id },
          data: { institucionId: record.id },
        });
      }
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

    if (directorDni) {
      const directorPersona = await this.prisma.persona.findUnique({
        where: { dni: directorDni },
      });
      if (directorPersona) {
        await this.prisma.docente.update({
          where: { personaId: directorPersona.id },
          data: { institucionId: id },
        });
      }
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
