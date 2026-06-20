import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EspecialistaRepository } from './especialista.repository.js';
import type {
  IEspecialistaResponse,
  ICreateEspecialistaRequest,
  IUpdateEspecialistaRequest,
  IQueryEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';

type EspecialistaWithRelations = Prisma.EspecialistaGetPayload<{
  include: {
    persona: {
      include: {
        usuario: {
          include: {
            rol: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class PrismaEspecialistaRepository implements EspecialistaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapEspecialista(esp: EspecialistaWithRelations): IEspecialistaResponse {
    return {
      id: esp.id,
      personaId: esp.personaId,
      especialidad: (esp as any).especialidades?.map((e: any) => e.especialidad?.nombre).filter(Boolean).join(', ') ?? null,
      nivelEducativo: esp.nivelEducativo,
      modalidad: esp.modalidad ?? null,
      estado: esp.estado,
      cargaLaboral: esp.cargaLaboral,
      cargo: esp.cargo,
      condicionLaboral: esp.condicionLaboral ?? null,
      escalaMagisterial: esp.escalaMagisterial,
      createdAt: esp.createdAt,
      updatedAt: esp.updatedAt,
      persona: {
        id: esp.persona.id,
        dni: esp.persona.dni,
        nombres: esp.persona.nombres,
        apellidos: esp.persona.apellidos,
        correo: esp.persona.correo,
        telefono: esp.persona.telefono,
      },
      user: esp.persona.usuario
        ? {
            id: esp.persona.usuario.id,
            role: {
              code: esp.persona.usuario.rol.codigo,
              name: esp.persona.usuario.rol.nombre,
            },
          }
        : undefined,
    };
  }

  async findAll(filters?: IQueryEspecialistaRequest): Promise<IEspecialistaResponse[]> {
    const list = await this.prisma.especialista.findMany({
      where: {
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.nivelEducativo && { nivelEducativo: filters.nivelEducativo }),
        ...(filters?.cargo && { cargo: filters.cargo }),
      },
      include: {
        persona: {
          include: {
            usuario: {
              include: {
                rol: true,
              },
            },
          },
        },
      },
    });

    return list.map((esp) => this.mapEspecialista(esp));
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
      include: {
        persona: {
          include: {
            usuario: {
              include: {
                rol: true,
              },
            },
          },
        },
      },
    });
    if (!esp) return null;

    return this.mapEspecialista(esp);
  }

  async create(
    data: ICreateEspecialistaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IEspecialistaResponse> {
    return await this.prisma.$transaction(async (tx) => {
      // A. Crear Persona
      const persona = await tx.persona.create({
        data: {
          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo || null,
          telefono: data.telefono || null,
        },
      });

      // C. Crear Usuario
      await tx.usuario.create({
        data: {
          personaId: persona.id,
          rolId: roleId,
          passwordHash,
          isActive: true,
          isFirstLogin: true,
        },
      });

      // D. Crear Especialista
      const especialista = await tx.especialista.create({
        data: {
          personaId: persona.id,
          nivelEducativo: data.nivelEducativo,
          estado: EstadoRegistro.ACTIVO,
          cargo: data.cargo || CargoNombre.ESPECIALISTA,
          condicionLaboral: data.condicionLaboral || CondicionLaboral.NOMBRADO,
          cargaLaboral: data.cargaLaboral ?? 40,
          escalaMagisterial: data.escalaMagisterial ?? null,
        },
      });

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id: especialista.id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
        },
      });

      return this.mapEspecialista(fullEsp);
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
          correo: data.correo !== undefined ? data.correo || null : undefined,
          telefono: data.telefono !== undefined ? data.telefono || null : undefined,
        },
      });

      // B. Actualizar Rol en tabla Usuario si corresponde
      if (roleId) {
        await tx.usuario.update({
          where: { personaId: esp.personaId },
          data: {
            rolId: roleId,
          },
        });
      }

      // C. Actualizar Especialista (nivel, estado)
      await tx.especialista.update({
        where: { id },
        data: {
          nivelEducativo: data.nivelEducativo,
          estado: data.estado,
          ...(data.cargo && { cargo: data.cargo }),
          ...(data.condicionLaboral && { condicionLaboral: data.condicionLaboral }),
          cargaLaboral: data.cargaLaboral !== undefined ? data.cargaLaboral : undefined,
          escalaMagisterial:
            data.escalaMagisterial !== undefined ? data.escalaMagisterial : undefined,
        },
      });

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    let count = 0n;
    try {
      const result = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM visitas_monitoreo WHERE especialista_id = ${id}::uuid
      `;
      count = result[0]?.count ?? 0n;
    } catch (err: unknown) {
      // Si la tabla "visitas_monitoreo" no existe en la base de datos (PostgreSQL 42P01 / Prisma P2010),
      // asumimos que el especialista tiene 0 visitas registradas.
      const error = err as { message?: string; meta?: { message?: string } };
      const isTableMissing =
        error.message?.includes('42P01') ||
        error.meta?.message?.includes('42P01') ||
        String(err).includes('42P01');
      if (isTableMissing) {
        count = 0n;
      } else {
        throw err;
      }
    }

    if (count > 0n) {
      throw new UnprocessableEntityException(
        `No se puede inactivar: el especialista tiene ${count} visita(s) de monitoreo registrada(s).`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Inactivar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: false },
      });

      // Inactivar especialista
      await tx.especialista.update({
        where: { id },
        data: { estado: EstadoRegistro.INACTIVO },
      });

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async activate(id: string): Promise<IEspecialistaResponse> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Activar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: true },
      });

      // Activar especialista
      await tx.especialista.update({
        where: { id },
        data: { estado: EstadoRegistro.ACTIVO },
      });

      const fullEsp = await tx.especialista.findUniqueOrThrow({
        where: { id },
        include: {
          persona: {
            include: {
              usuario: {
                include: {
                  rol: true,
                },
              },
            },
          },
        },
      });

      return this.mapEspecialista(fullEsp);
    });
  }

  async deactivate(id: string): Promise<IEspecialistaResponse> {
    return this.delete(id);
  }
}
