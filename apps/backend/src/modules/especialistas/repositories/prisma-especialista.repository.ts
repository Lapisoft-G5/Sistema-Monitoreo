import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EspecialistaRepository } from './especialista.repository.js';
import type { IEspecialistaResponse, ICreateEspecialistaRequest, IUpdateEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';

@Injectable()
export class PrismaEspecialistaRepository implements EspecialistaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<IEspecialistaResponse[]> {
    const list = await this.prisma.especialista.findMany({
      include: {
        persona: true,
      },
    });

    const results: IEspecialistaResponse[] = [];
    for (const esp of list) {
      const user = await this.prisma.user.findUnique({
        where: { personaId: esp.personaId },
        include: { role: true },
      });
      results.push({
        ...esp,
        user: user
          ? {
              id: user.id,
              role: {
                code: user.role.code,
                name: user.role.name,
              },
            }
          : undefined,
      });
    }
    return results;
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
      include: {
        persona: true,
      },
    });
    if (!esp) return null;

    const user = await this.prisma.user.findUnique({
      where: { personaId: esp.personaId },
      include: { role: true },
    });

    return {
      ...esp,
      user: user
        ? {
            id: user.id,
            role: {
              code: user.role.code,
              name: user.role.name,
            },
          }
        : undefined,
    };
  }

  async create(data: ICreateEspecialistaRequest, passwordHash: string): Promise<IEspecialistaResponse> {
    // 1. Validar unicidad del DNI
    const existingPersona = await this.prisma.persona.findUnique({
      where: { dni: data.dni },
    });
    if (existingPersona) {
      throw new ConflictException(`La persona con DNI ${data.dni} ya está registrada en el sistema.`);
    }

    // 2. Usar transaccion de Prisma para insertar ordenadamente
    return await this.prisma.$transaction(async (tx) => {
      // A. Crear Persona
      const persona = await tx.persona.create({
        data: {
          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo || null,
        },
      });

      // B. Buscar el Rol
      const role = await tx.role.findUnique({
        where: { code: data.rolCode },
      });
      if (!role) {
        throw new NotFoundException(`El rol ${data.rolCode} no existe.`);
      }

      // C. Crear Usuario
      const user = await tx.user.create({
        data: {
          personaId: persona.id,
          roleId: role.id,
          passwordHash,
          isActive: true,
          isFirstLogin: true,
        },
      });

      // D. Crear Especialista
      const especialista = await tx.especialista.create({
        data: {
          personaId: persona.id,
          especialidad: data.especialidad,
          nivelEducativo: data.nivelEducativo,
          estado: 'Activo',
        },
        include: {
          persona: true,
        },
      });

      return {
        ...especialista,
        user: {
          id: user.id,
          role: {
            code: role.code,
            name: role.name,
          },
        },
      };
    });
  }

  async update(id: string, data: IUpdateEspecialistaRequest): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Persona (dni bloqueado)
      await tx.persona.update({
        where: { id: esp.personaId },
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo || null,
        },
      });

      // B. Buscar y actualizar Rol en tabla User si corresponde
      const role = await tx.role.findUnique({
        where: { code: data.rolCode },
      });
      if (role) {
        await tx.user.update({
          where: { personaId: esp.personaId },
          data: {
            roleId: role.id,
          },
        });
      }

      // C. Actualizar Especialista (especialidad, nivel, estado)
      const updated = await tx.especialista.update({
        where: { id },
        data: {
          especialidad: data.especialidad,
          nivelEducativo: data.nivelEducativo,
          estado: data.estado,
        },
        include: {
          persona: true,
        },
      });

      const user = await tx.user.findUnique({
        where: { personaId: esp.personaId },
        include: { role: true },
      });

      return {
        ...updated,
        user: user
          ? {
              id: user.id,
              role: {
                code: user.role.code,
                name: user.role.name,
              },
            }
          : undefined,
      };
    });
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Inactivar usuario asociado
      await tx.user.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: false },
      });

      // Inactivar especialista
      const updated = await tx.especialista.update({
        where: { id },
        data: { estado: 'Inactivo' },
        include: { persona: true },
      });

      const user = await tx.user.findUnique({
        where: { personaId: esp.personaId },
        include: { role: true },
      });

      return {
        ...updated,
        user: user
          ? {
              id: user.id,
              role: {
                code: user.role.code,
                name: user.role.name,
              },
            }
          : undefined,
      };
    });
  }
}
