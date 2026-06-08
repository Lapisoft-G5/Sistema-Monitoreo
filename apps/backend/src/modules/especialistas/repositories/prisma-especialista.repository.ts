import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EspecialistaRepository } from './especialista.repository.js';
import type {
  IEspecialistaResponse,
  ICreateEspecialistaRequest,
  IUpdateEspecialistaRequest,
  IQueryEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';

@Injectable()
export class PrismaEspecialistaRepository implements EspecialistaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: IQueryEspecialistaRequest): Promise<IEspecialistaResponse[]> {
    const list = await this.prisma.especialista.findMany({
      where: {
        estado: filters?.estado ?? 'Activo',
        ...(filters?.especialidad && { especialidad: filters.especialidad }),
        ...(filters?.nivelEducativo && { nivelEducativo: filters.nivelEducativo }),
      },
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

  async create(
    data: ICreateEspecialistaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IEspecialistaResponse> {
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

      // C. Crear Usuario
      const user = await tx.user.create({
        data: {
          personaId: persona.id,
          roleId: roleId,
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
            code: data.rolCode,
            name: data.rolCode,
          },
        },
      };
    });
  }

  async update(
    id: string,
    data: IUpdateEspecialistaRequest,
    roleId?: string,
  ): Promise<IEspecialistaResponse> {
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

      // B. Actualizar Rol en tabla User si corresponde
      if (roleId) {
        await tx.user.update({
          where: { personaId: esp.personaId },
          data: {
            roleId: roleId,
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

    const [{ count }] = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM visitas_monitoreo WHERE especialista_id = ${id}::uuid
    `;
    if (count > 0n) {
      throw new UnprocessableEntityException(
        `No se puede inactivar: el especialista tiene ${count} visita(s) de monitoreo registrada(s).`,
      );
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
