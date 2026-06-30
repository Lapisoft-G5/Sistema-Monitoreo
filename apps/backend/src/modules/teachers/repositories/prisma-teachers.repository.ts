import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { DocenteCargo } from '../../../generated/prisma/client.js';
import { DocenteEntity, DocenteFilter, TeachersRepository } from './teachers.repository.js';
import { findDocenteById, findDocentes, findPersonaByDni } from './docente-read.helper.js';
import { updateDocenteEstado, bajaDirector } from './docente-update-estado.helper.js';
import { createDocenteWithTransaction } from './docente-create.helper.js';
import { updateDocenteWithTransaction } from './docente-update.helper.js';
import { transicionEspecialistaADocente } from './transicion-rol.helper.js';

@Injectable()
export class PrismaTeachersRepository implements TeachersRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async findDocenteById(id: string): Promise<DocenteEntity | null> {
    return findDocenteById(this.prisma, id);
  }

  async findPersonaByDni(dni: string): Promise<any> {
    return findPersonaByDni(this.prisma, dni);
  }

  async findDocentes(filter?: DocenteFilter): Promise<DocenteEntity[]> {
    return findDocentes(this.prisma, filter);
  }

  async updateDocenteEstado(id: string, estado: string): Promise<DocenteEntity> {
    return updateDocenteEstado(this.prisma, id, estado);
  }

  async bajaDirector(id: string): Promise<DocenteEntity> {
    return bajaDirector(this.prisma, id);
  }

  async createDocenteWithTransaction(dto: CreateDocenteDto): Promise<DocenteEntity> {
    return createDocenteWithTransaction(this.prisma, this.configService, dto);
  }

  async updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: DocenteCargo | null,
    personaId: string,
  ): Promise<DocenteEntity> {
    return updateDocenteWithTransaction(this.prisma, id, dto, activeCargo, personaId);
  }

  async transicionEspecialistaADocente(
    personaId: string,
    dto: CreateDocenteDto,
    rolDocenteId: string,
  ): Promise<DocenteEntity> {
    return transicionEspecialistaADocente(this.prisma, personaId, dto, rolDocenteId);
  }
}
