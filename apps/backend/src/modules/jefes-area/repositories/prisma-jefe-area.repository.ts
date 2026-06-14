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

type JefeAreaWithRelations = Prisma.EspecialistaGetPayload<{
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
      cargaHoraria: jefe.cargaLaboral,
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
    const list = await this.prisma.especialista.findMany({
      where: {
        cargo: { in: ['Jefe de Área', 'Jefe de Gestión'] },
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
    const jefe = await this.prisma.especialista.findUnique({
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
    if (!jefe || !['Jefe de Área', 'Jefe de Gestión'].includes(jefe.cargo)) return null;

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

      // C. Crear Especialista (Jefe Area)
      const rol = await tx.role.findUnique({ where: { id: roleId } });
      const cargo = rol?.codigo === 'jefe_gestion' ? 'Jefe de Gestión' : 'Jefe de Área';

      const jefeArea = await tx.especialista.create({
        data: {
          personaId: persona.id,
          cargaLaboral: data.cargaHoraria ?? 40,
          nivelEducativo: data.nivelEducativo,
          estado: EstadoRegistro.ACTIVO,
          cargo: cargo,
          condicionLaboral: 'Nombrado', // Valor por defecto
          especialidad: 'General',
          modalidad: 'EBR',
        },
      });

      const fullJefe = await tx.especialista.findUniqueOrThrow({
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
    const jefe = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!jefe || !['Jefe de Área', 'Jefe de Gestión'].includes(jefe.cargo)) {
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

      // C. Actualizar Especialista
      await tx.especialista.update({
        where: { id },
        data: {
          cargaLaboral: data.cargaHoraria !== undefined ? data.cargaHoraria : undefined,
          nivelEducativo: data.nivelEducativo,
          estado: data.estado,
        },
      });

      const fullJefe = await tx.especialista.findUniqueOrThrow({
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
    const jefe = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!jefe || !['Jefe de Área', 'Jefe de Gestión'].includes(jefe.cargo)) {
      throw new NotFoundException(`Jefe de Área con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Inactivar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: jefe.personaId },
        data: { isActive: false },
      });

      // Inactivar Especialista
      await tx.especialista.update({
        where: { id },
        data: { estado: EstadoRegistro.INACTIVO },
      });

      const fullJefe = await tx.especialista.findUniqueOrThrow({
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
    const jefe = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!jefe || !['Jefe de Área', 'Jefe de Gestión'].includes(jefe.cargo)) {
      throw new NotFoundException(`Jefe de Área con ID ${id} no encontrado.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Activar usuario asociado
      await tx.usuario.updateMany({
        where: { personaId: jefe.personaId },
        data: { isActive: true },
      });

      // Activar Especialista
      await tx.especialista.update({
        where: { id },
        data: { estado: EstadoRegistro.ACTIVO },
      });

      const fullJefe = await tx.especialista.findUniqueOrThrow({
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
