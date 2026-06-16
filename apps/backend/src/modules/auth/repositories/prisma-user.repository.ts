import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { UserRepository } from './user.repository.js';
import { Usuario } from '../entities/user.entity.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByDni(dni: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({
      where: { persona: { dni } },
      include: {
        rol: {
          include: {
            rolPermisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
        persona: {
          include: {
            docente: {
              include: { institucion: true, docenteCargos: { include: { cargo: true } } },
            },
            especialista: true,
          },
        },
      },
    });
  }

  async findUserById(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: {
          include: {
            rolPermisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
        persona: {
          include: {
            docente: {
              include: { institucion: true, docenteCargos: { include: { cargo: true } } },
            },
            especialista: true,
          },
        },
      },
    });
  }

  async findUserByDniAndEmail(dni: string, email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({
      where: { persona: { dni, correo: email } },
      include: { rol: true, persona: true },
    });
  }

  async updateLastLogin(userId: string, now: Date): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: userId },
        data: { passwordHash, isFirstLogin: false, passwordChangedAt: new Date() },
      }),
      this.prisma.sesionAuth.updateMany({
        where: { usuarioId: userId, isActive: true },
        data: { isActive: false, loggedOutAt: new Date(), terminatedReason: 'PASSWORD_CHANGED' },
      }),
    ]);
  }

  async incrementFailedAttempts(userId: string, now: Date): Promise<number> {
    const user = await this.prisma.usuario.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 }, lastFailedLoginAt: now },
      select: { failedLoginAttempts: true },
    });
    return user.failedLoginAttempts;
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { lockedUntil: until },
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }
}
