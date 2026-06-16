var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';
let PrismaEspecialistaRepository = class PrismaEspecialistaRepository {
  prisma;
  constructor(prisma) {
    this.prisma = prisma;
  }
  mapEspecialista(esp) {
    return {
      id: esp.id,
      personaId: esp.personaId,
      especialidad: esp.especialidad ?? null,
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
  async findAll(filters) {
    const list = await this.prisma.especialista.findMany({
      where: {
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.especialidad && { especialidad: filters.especialidad }),
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
  async findById(id) {
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
  async create(data, passwordHash, roleId) {
    return await this.prisma.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo || null,
          telefono: data.telefono || null,
        },
      });
      await tx.usuario.create({
        data: {
          personaId: persona.id,
          rolId: roleId,
          passwordHash,
          isActive: true,
          isFirstLogin: true,
        },
      });
      const especialista = await tx.especialista.create({
        data: {
          personaId: persona.id,
          especialidad: data.especialidad,
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
  async update(id, data, roleId) {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }
    return await this.prisma.$transaction(async (tx) => {
      await tx.persona.update({
        where: { id: esp.personaId },
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo !== undefined ? data.correo || null : undefined,
          telefono: data.telefono !== undefined ? data.telefono || null : undefined,
        },
      });
      if (roleId) {
        await tx.usuario.update({
          where: { personaId: esp.personaId },
          data: {
            rolId: roleId,
          },
        });
      }
      await tx.especialista.update({
        where: { id },
        data: {
          especialidad: data.especialidad,
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
  async delete(id) {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }
    let count = 0n;
    try {
      const result = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM visitas_monitoreo WHERE especialista_id = ${id}::uuid
      `;
      count = result[0]?.count ?? 0n;
    } catch (err) {
      const error = err;
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
      await tx.usuario.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: false },
      });
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
  async activate(id) {
    const esp = await this.prisma.especialista.findUnique({
      where: { id },
    });
    if (!esp) {
      throw new NotFoundException(`Especialista con ID ${id} no encontrado.`);
    }
    return await this.prisma.$transaction(async (tx) => {
      await tx.usuario.updateMany({
        where: { personaId: esp.personaId },
        data: { isActive: true },
      });
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
  async deactivate(id) {
    return this.delete(id);
  }
};
PrismaEspecialistaRepository = __decorate(
  [Injectable(), __metadata('design:paramtypes', [PrismaService])],
  PrismaEspecialistaRepository,
);
export { PrismaEspecialistaRepository };
//# sourceMappingURL=prisma-especialista.repository.js.map
