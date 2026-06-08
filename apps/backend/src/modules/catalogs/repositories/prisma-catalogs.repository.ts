import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CatalogsRepository } from './catalogs.repository.js';
import {
  InstitucionEducativa,
  Cargo,
  Persona,
  Role,
} from '../../../generated/prisma/client.js';

@Injectable()
export class PrismaCatalogsRepository implements CatalogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInstitucionById(id: string): Promise<InstitucionEducativa | null> {
    return this.prisma.institucionEducativa.findUnique({
      where: { id },
    });
  }

  async findCargoById(id: string): Promise<Cargo | null> {
    return this.prisma.cargo.findUnique({
      where: { id },
    });
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { code },
    });
  }

  async findPersonaByDni(dni: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { dni },
    });
  }

  async findPersonaByEmail(email: string): Promise<Persona | null> {
    return this.prisma.persona.findFirst({
      where: { correo: email },
    });
  }

  async findPersonaByEmailNotId(email: string, excludePersonaId: string): Promise<Persona | null> {
    return this.prisma.persona.findFirst({
      where: {
        correo: email,
        id: { not: excludePersonaId },
      },
    });
  }
}
