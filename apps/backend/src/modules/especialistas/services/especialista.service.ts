import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';
import { CargoEspecialista } from '@sistema-monitoreo/shared-contracts';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { JwtPayload } from '../../auth/services/auth-token.service.js';

@Injectable()
export class EspecialistaService {
  constructor(
    private readonly repository: EspecialistaRepository,
    private readonly catalogsRepository: CatalogsRepository,
  ) {}

  async findAll(filters?: QueryEspecialistaDto): Promise<IEspecialistaResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    return this.repository.findById(id);
  }

  async create(
    dto: CreateEspecialistaDto,
    currentUser: JwtPayload,
  ): Promise<IEspecialistaResponse> {
    // ── Regla 1: Solo Director UGEL o Jefe de Área pueden crear Jefes de Gestión
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      if (currentUser.role !== RoleCode.DIRECTOR_UGEL && currentUser.role !== RoleCode.JEFE_AREA) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para crear un perfil de Jefe de Gestión.',
        );
      }
    }

    // ── Regla 2: Jefe de Gestión → condicion_laboral obligatoriamente Nombrado
    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION &&
      (dto.condicionLaboral as CondicionLaboral) !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }

    // ── Regla 3: Jefe de Área → carga_laboral obligatoriamente 40 horas
    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_AREA &&
      dto.cargaLaboral !== undefined &&
      dto.cargaLaboral !== 40
    ) {
      throw new BadRequestException(
        'La carga laboral de un Jefe de Área debe ser exactamente 40 horas.',
      );
    }

    // ── Regla 4: Especialista → la especialidad es obligatoria en Secundaria
    //   (esta lógica ya está cubierta por el validator IsValidEspecialidadForNivel
    //    en el DTO, pero como doble-guarda la aplicamos aquí también)
    if (
      (dto.cargo as CargoNombre) === CargoNombre.ESPECIALISTA &&
      dto.nivelEducativo === 'Secundaria' &&
      (!dto.especialidad || dto.especialidad.trim() === '')
    ) {
      throw new BadRequestException(
        'Para un Especialista de nivel Secundaria, la especialidad es obligatoria.',
      );
    }

    const existingPersona = await this.catalogsRepository.findPersonaByDni(dto.dni);
    if (existingPersona) {
      throw new ConflictException(
        `La persona con DNI ${dto.dni} ya está registrada en el sistema.`,
      );
    }

    const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
    if (!role) {
      throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
    }

    // Para Jefe de Gestión, la condicion se normaliza siempre a Nombrado
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      dto.condicionLaboral = CondicionLaboral.NOMBRADO;
    }

    // Para Jefe de Área, carga_laboral siempre se normaliza a 40
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_AREA) {
      dto.cargaLaboral = 40;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
    return this.repository.create(dto, passwordHash, role.id);
  }

  async update(
    id: string,
    dto: UpdateEspecialistaDto,
    currentUser: JwtPayload,
  ): Promise<IEspecialistaResponse> {
    // ── Regla 1: Solo Director UGEL o Jefe de Área pueden modificar Jefes de Gestión
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      if (currentUser.role !== RoleCode.DIRECTOR_UGEL && currentUser.role !== RoleCode.JEFE_AREA) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para actualizar un perfil de Jefe de Gestión.',
        );
      }
    }

    // ── Regla 2: Jefe de Gestión → condicion_laboral obligatoriamente Nombrado
    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION &&
      (dto.condicionLaboral as CondicionLaboral) !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }

    // ── Regla 3: Jefe de Área → carga_laboral obligatoriamente 40 horas
    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_AREA &&
      dto.cargaLaboral !== undefined &&
      dto.cargaLaboral !== 40
    ) {
      throw new BadRequestException(
        'La carga laboral de un Jefe de Área debe ser exactamente 40 horas.',
      );
    }

    // ── Regla 4: Especialista → la especialidad es obligatoria en Secundaria
    if (
      (dto.cargo as CargoNombre) === CargoNombre.ESPECIALISTA &&
      dto.nivelEducativo === 'Secundaria' &&
      (!dto.especialidad || dto.especialidad.trim() === '')
    ) {
      throw new BadRequestException(
        'Para un Especialista de nivel Secundaria, la especialidad es obligatoria.',
      );
    }

    // Para Jefe de Gestión normalizar condicion
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      dto.condicionLaboral = CondicionLaboral.NOMBRADO;
    }

    // Para Jefe de Área normalizar carga horaria
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_AREA) {
      dto.cargaLaboral = 40;
    }

    let roleId: string | undefined;
    if (dto.rolCode) {
      const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
      if (!role) {
        throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
      }
      roleId = role.id;
    }
    return this.repository.update(id, dto, roleId);
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    return this.repository.delete(id);
  }

  async activate(id: string): Promise<IEspecialistaResponse> {
    return this.repository.activate(id);
  }

  async deactivate(id: string): Promise<IEspecialistaResponse> {
    return this.repository.deactivate(id);
  }
}

// Re-export constant for backward compatibility (replaces old CargoNombre.JEFE_AREA usages)
export { CargoEspecialista };
