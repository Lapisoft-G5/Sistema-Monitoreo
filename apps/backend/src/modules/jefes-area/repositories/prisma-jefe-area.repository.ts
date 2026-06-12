import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { JefeAreaRepository } from './jefe-area.repository.js';
import type {
  IJefeAreaResponse,
  ICreateJefeAreaRequest,
  IUpdateJefeAreaRequest,
  IQueryJefeAreaRequest,
} from '@sistema-monitoreo/shared-contracts';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';

type JefeAreaWithRelations = Prisma.JefeAreaGetPayload<{
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
export class PrismaJefeAreaRepository implements JefeAreaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapJefeArea(jefe: JefeAreaWithRelations): IJefeAreaResponse {
    return {
      id: jefe.id,
      personaId: jefe.personaId,
      cargaHoraria: jefe.cargaHoraria,
      nivelEducativo: jefe.nivelEducativo,
      estado: jefe.estado,
      createdAt: jefe.createdAt,
      updatedAt: jefe.updatedAt,
      persona: {
        id: jefe.persona.id,
        dni: jefe.persona.dni,
        nombres: jefe.persona.nombres,
        apellidos: jefe.persona.apellidos,
        correo: jefe.persona.correo,
        telefono: jefe.persona.telefono,
      },
      user: jefe.persona.usuario
        ? {
            id: jefe.persona.usuario.id,
            role: {
              code: jefe.persona.usuario.rol.codigo,
              name: jefe.persona.usuario.rol.nombre,
            },
          }
        : undefined,
    };
  }

  async findAll(filters?: IQueryJefeAreaRequest): Promise<IJefeAreaResponse[]> {
    const list = await this.prisma.jefeArea.findMany({
      where: {
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.nivelEducativo && { nivelEducativo: filters.nivelEducativo }),
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

    return list.map((jefe) => this.mapJefeArea(jefe));
  }

  async findById(id: string): Promise<IJefeAreaResponse | null> {
    const jefe = await this.prisma.jefeArea.findUnique({
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
    if (!jefe) return null;

    return this.mapJefeArea(jefe);
  }

  async create(
    data: ICreateJefeAreaRequest,
    passwordHash: string,
    roleId: string,
  ): Promise<IJefeAreaResponse> {
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

      // B. Crear Usuario
      await tx.usuario.create({
        data: {
          personaId: persona.id,
          rolId: roleId,
          passwordHash,
          isActive: true,
          isFirstLogin: true,
        },
      });

      // C. Crear Jefe Area
      const jefeArea = await tx.jefeArea.create({
        data: {
          personaId: persona.id,
          cargaHoraria: data.cargaHoraria ?? 40,
          nivelEducativo: data.nivelEducativo,
          estado: EstadoRegistro.ACTIVO,
        },
      });

      const fullJefe = await tx.jefeArea.findUniqueOrThrow({
        where: { id: jefeArea.id },
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

      return this.mapJefeArea(fullJefe);
    });
  }

  async update(
    id: string,
    data: IUpdateJefeAreaRequest,
    roleId?: string,
  ): Promise<IJefeAreaResponse> {
    const jefe = await this.prisma.jefeArea.findUnique({
      where: { id },
    });
    if (!jefe) {
      throw new NotFoundException(`Jefe de Área con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Persona
      await tx.persona.update({
        where: { id: jefe.personaId },
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo !== undefined ? (data.correo || null) : undefined,
          telefono: data.telefono !== undefined ? (data.telefono || null) : undefined,
        },
      });

      // B. Actualizar Rol en tabla Usuario si corresponde
      if (roleId) {
        await tx.usuario.update({
          where: { personaId: jefe.personaId },
          data: {
            rolId: roleId,
          },
        });
      }

      // C. Actualizar Jefe Area
      await tx.jefeArea.update({
        where: { id },
        data: {
          cargaHoraria: data.cargaHoraria !== undefined ? data.cargaHoraria : undefined,
          nivelEducativo: data.nivelEducativo,
          estado: data.estado,
        },
      });

      const fullJefe = await tx.jefeArea.findUniqueOrThrow({
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

      return this.mapJefeArea(fullJefe);
    });
  }

  async delete(id: string): Promise<IJefeAreaResponse> {
    const jefe = await this.prisma.jefeArea.findUnique({
      where: { id },
    });
    if (!jefe) {
      throw new NotFoundException(`Jefe de Área con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Inactivar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: jefe.personaId },
        data: { isActive: false },
      });

      // Inactivar Jefe Area
      await tx.jefeArea.update({
        where: { id },
        data: { estado: EstadoRegistro.INACTIVO },
      });

      const fullJefe = await tx.jefeArea.findUniqueOrThrow({
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

      return this.mapJefeArea(fullJefe);
    });
  }

  async activate(id: string): Promise<IJefeAreaResponse> {
    const jefe = await this.prisma.jefeArea.findUnique({
      where: { id },
    });
    if (!jefe) {
      throw new NotFoundException(`Jefe de Área con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Activar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: jefe.personaId },
        data: { isActive: true },
      });

      // Activar Jefe Area
      await tx.jefeArea.update({
        where: { id },
        data: { estado: EstadoRegistro.ACTIVO },
      });

      const fullJefe = await tx.jefeArea.findUniqueOrThrow({
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

      return this.mapJefeArea(fullJefe);
    });
  }

  async deactivate(id: string): Promise<IJefeAreaResponse> {
    return this.delete(id);
  }
}
