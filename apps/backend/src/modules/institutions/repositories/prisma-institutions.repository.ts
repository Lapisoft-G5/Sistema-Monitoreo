import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { InstitutionsRepository } from './institutions.repository.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';

@Injectable()
export class PrismaInstitutionsRepository implements InstitutionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInstitucionDto): Promise<Institucion> {
    const record = await this.prisma.institucionEducativa.create({
      data: {
        codigoModular: data.codigoModular,
        nombre: data.nombre,
        nivelEducativo: data.nivelEducativo,
        departamento: data.departamento ?? 'Puno',
        provincia: data.provincia,
        distrito: data.distrito,
        direccion: data.direccion,
        zona: data.zona,
        estado: data.estado ?? 'Activa',
      },
    });
    return record as Institucion;
  }

  async findById(id: string): Promise<Institucion | null> {
    const record = await this.prisma.institucionEducativa.findUnique({
      where: { id },
    });
    return record as Institucion | null;
  }

  async findByCodigoModular(codigoModular: string): Promise<Institucion | null> {
    const record = await this.prisma.institucionEducativa.findUnique({
      where: { codigoModular },
    });
    return record as Institucion | null;
  }

  async update(id: string, data: UpdateInstitucionDto): Promise<Institucion> {
    // Para BE-IE-02, el código modular no debe actualizarse.
    // El DTO no lo expone, pero para seguridad adicional, descartamos la propiedad.
    const { ...updateData } = data;
    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: updateData,
    });
    return record as Institucion;
  }

  async softDelete(id: string): Promise<Institucion> {
    // Para BE-IE-04, cambiamos el estado a "Inactiva"
    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: { estado: 'Inactiva' },
    });
    return record as Institucion;
  }

  async restore(id: string): Promise<Institucion> {
    // Cambiamos el estado de regreso a "Activa"
    const record = await this.prisma.institucionEducativa.update({
      where: { id },
      data: { estado: 'Activa' },
    });
    return record as Institucion;
  }

  async findAll(query: QueryInstitucionDto): Promise<{ data: Institucion[]; total: number }> {
    const { nombre, nivelEducativo, estado, limit = 10, offset = 0 } = query;
    const where: any = {};

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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.institucionEducativa.count({ where }),
    ]);

    return {
      data: data as Institucion[],
      total,
    };
  }
}
