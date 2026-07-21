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
          codigo: {
            in: [
              RoleCode.ESPECIALISTA,
              RoleCode.JEFE_AREA,
              RoleCode.JEFE_GESTION,
              RoleCode.DIRECTOR_UGEL,
            ],
          },
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
    const rolSolicitado = roleCode as RoleCode;
    if (rolSolicitado !== RoleCode.DIRECTOR_UGEL && rolSolicitado !== RoleCode.JEFE_GESTION) {
      throw new BadRequestException(
        'El superusuario solo puede asignar roles de Director UGEL o Jefe de Gestión.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { rol: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const rolActual = usuario.rol.codigo as RoleCode;

    if (rolActual === RoleCode.SUPERUSUARIO) {
      throw new BadRequestException('No se puede modificar el rol de un superusuario.');
    }

    if (
      (rolActual === RoleCode.DIRECTOR_UGEL && rolSolicitado === RoleCode.JEFE_GESTION) ||
      (rolActual === RoleCode.JEFE_GESTION && rolSolicitado === RoleCode.DIRECTOR_UGEL)
    ) {
      throw new BadRequestException(
        'El usuario actual ostenta un alto cargo directivo. Debe ser relevado de su cargo actual antes de asumir otro.',
      );
    }

    const newRole = await this.prisma.role.findUnique({
      where: { codigo: roleCode },
    });

    if (!newRole) {
      throw new NotFoundException('El rol solicitado no existe en el catálogo.');
    }

    const baseEspecialistaRole = await this.prisma.role.findUnique({
      where: { codigo: RoleCode.ESPECIALISTA },
    });

    if (!baseEspecialistaRole) {
      throw new NotFoundException('El rol de Especialista base no existe.');
    }

    // Usar una transacción para asegurar consistencia
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // 1. Demoler a quien actualmente tenga el rol solicitado (si hay alguien)
      const currentUserWithRole = await tx.usuario.findFirst({
        where: { rolId: newRole.id },
      });

      if (currentUserWithRole && currentUserWithRole.id !== usuarioId) {
        await tx.usuario.update({
          where: { id: currentUserWithRole.id },
          data: { rolId: baseEspecialistaRole.id },
        });
      }

      // 2. Asignar el nuevo rol al usuario objetivo
      return tx.usuario.update({
        where: { id: usuarioId },
        data: {
          rolId: newRole.id,
        },
        include: {
          persona: true,
          rol: true,
        },
      });
    });

    return {
      success: true,
      message: `Rol asignado correctamente a ${updatedUser.persona.nombres}.`,
      usuario: {
        id: updatedUser.id,
        rolActual: updatedUser.rol.nombre,
        rolCodigo: updatedUser.rol.codigo,
      },
    };
  }
}
