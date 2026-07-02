import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { RoleCode } from '../../common/enums/role.enum.js';

@Injectable()
export class SuperuserService {
  constructor(private readonly prisma: PrismaService) {}

  async getCandidatos() {
    // Retorna todos los usuarios que no son superusuario, incluyendo información de Persona y Rol.
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        rol: {
          codigo: { not: RoleCode.SUPERUSUARIO },
        },
      },
      include: {
        persona: true,
        rol: true,
      },
      orderBy: {
        persona: { nombres: 'asc' },
      },
    });

    return usuarios.map((u) => ({
      id: u.id,
      dni: u.persona.dni,
      nombres: u.persona.nombres,
      apellidos: u.persona.apellidos,
      correo: u.persona.correo,
      rolActual: u.rol.nombre,
      rolCodigo: u.rol.codigo,
      activo: u.isActive,
    }));
  }

  async asignarRol(usuarioId: string, roleCode: string) {
    if (roleCode !== RoleCode.DIRECTOR_UGEL && roleCode !== RoleCode.JEFE_GESTION) {
      throw new BadRequestException('El superusuario solo puede asignar roles de Director UGEL o Jefe de Gestión.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { rol: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol.codigo === RoleCode.SUPERUSUARIO) {
      throw new BadRequestException('No se puede modificar el rol de un superusuario.');
    }

    const newRole = await this.prisma.role.findUnique({
      where: { codigo: roleCode },
    });

    if (!newRole) {
      throw new NotFoundException('El rol solicitado no existe en el catálogo.');
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        rolId: newRole.id,
      },
      include: {
        persona: true,
        rol: true,
      },
    });

    return {
      success: true,
      message: `Rol asignado correctamente a ${updatedUser.persona.nombres}.`,
      usuario: {
        id: updatedUser.id,
        rolActual: updatedUser.rol.nombre,
        rolCodigo: updatedUser.rol.codigo,
      }
    };
  }
}
