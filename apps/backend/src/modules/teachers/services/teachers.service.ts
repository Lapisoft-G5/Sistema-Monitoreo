import { Injectable, Inject, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { TeachersRepository } from '../repositories/teachers.repository.js';

@Injectable()
export class TeachersService {
  constructor(
    @Inject(TeachersRepository)
    private readonly teachersRepository: TeachersRepository,
  ) {}

  async createDocente(
    dto: CreateDocenteDto,
    currentUser: { id: string; role: string; colegio_id?: string; institucion_id?: string }
  ) {
    // 1. Control de accesos por rol
    if (
      currentUser.role !== RoleCode.DIRECTOR_INSTITUCION &&
      currentUser.role !== RoleCode.JEFE_AREA
    ) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Si es Director de IE, validar tokens y que no sea otra institución
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.');
      }
      if (dto.institucionId !== userInstitucionId) {
        throw new ForbiddenException('No tiene permisos para registrar un docente en otra institución educativa.');
      }
    }

    // 3. Validar existencia de la institución educativa
    const institucion = await this.teachersRepository.findInstitucionById(dto.institucionId);
    if (!institucion) {
      throw new NotFoundException('La institución educativa especificada no existe.');
    }

    // 4. Validar existencia del cargo
    const cargo = await this.teachersRepository.findCargoById(dto.cargoId);
    if (!cargo) {
      throw new NotFoundException('El cargo especificado no existe.');
    }

    // 5. Si es Director de IE, validar que no intente asignar Director o Coordinador Pedagógico
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      if (cargo.nombre === 'Director' || cargo.nombre === 'Coordinador Pedagógico') {
        throw new ForbiddenException('El Director de I.E. no puede asignar el cargo de Director o Coordinador Pedagógico.');
      }
    }

    // 6. Si es Jefe de Área, validar que solo pueda registrar cargos Director o Coordinador Pedagógico
    if (currentUser.role === RoleCode.JEFE_AREA) {
      if (cargo.nombre !== 'Director' && cargo.nombre !== 'Coordinador Pedagógico') {
        throw new ForbiddenException('El Jefe de Área solo puede registrar directores y coordinadores pedagógicos.');
      }
    }

    // 7. Crear el docente llamando al repositorio
    return this.teachersRepository.createDocenteWithTransaction(dto);
  }

  async getDocentes(currentUser: { role: string; colegio_id?: string; institucion_id?: string }) {
    // 1. Control de accesos por rol
    if (
      currentUser.role !== RoleCode.DIRECTOR_INSTITUCION &&
      currentUser.role !== RoleCode.JEFE_AREA &&
      currentUser.role !== RoleCode.DIRECTOR_UGEL
    ) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Definir filtros según rol
    const whereClause: any = {};
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.');
      }
      whereClause.institucionId = userInstitucionId;
    }

    // 3. Consultar docentes en el repositorio
    return this.teachersRepository.findDocentes(whereClause);
  }

  async updateDocente(
    id: string,
    dto: UpdateDocenteDto,
    currentUser: { id: string; role: string; colegio_id?: string; institucion_id?: string }
  ) {
    // 1. Control de accesos por rol
    if (
      currentUser.role !== RoleCode.DIRECTOR_INSTITUCION &&
      currentUser.role !== RoleCode.JEFE_AREA
    ) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Buscar el docente con su persona y cargo activo
    const docente = await this.teachersRepository.findDocenteById(id);
    if (!docente) {
      throw new NotFoundException('El docente especificado no existe.');
    }

    // 3. Si es Director de IE, validar pertenencia
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.');
      }
      if (docente.institucionId !== userInstitucionId) {
        throw new ForbiddenException('No tiene permisos para editar un docente de otra institución educativa.');
      }
    }

    // 4. Validar que el cargo exista
    const cargo = await this.teachersRepository.findCargoById(dto.cargoId);
    if (!cargo) {
      throw new NotFoundException('El cargo especificado no existe.');
    }

    // 5. Si es Director de IE, validar que no intente asignar Director o Coordinador Pedagógico
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      if (cargo.nombre === 'Director' || cargo.nombre === 'Coordinador Pedagógico') {
        throw new ForbiddenException('El Director de I.E. no puede asignar el cargo de Director o Coordinador Pedagógico.');
      }
    }

    // 6. Si es Jefe de Área, validar que el cargo a asignar y el cargo actual sean de Director o Coordinador Pedagógico
    if (currentUser.role === RoleCode.JEFE_AREA) {
      if (cargo.nombre !== 'Director' && cargo.nombre !== 'Coordinador Pedagógico') {
        throw new ForbiddenException('El Jefe de Área solo puede asignar el cargo de Director o Coordinador Pedagógico.');
      }
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.teachersRepository.findCargoById(activeCargoObj.cargoId);
        if (currentCargo && currentCargo.nombre !== 'Director' && currentCargo.nombre !== 'Coordinador Pedagógico') {
          throw new ForbiddenException('El Jefe de Área solo puede gestionar directores y coordinadores pedagógicos.');
        }
      }
    }

    // 7. Validar que el correo no esté duplicado por otra persona
    if (dto.correo && dto.correo !== docente.persona.correo) {
      const correoExists = await this.teachersRepository.findPersonaByEmailNotId(dto.correo, docente.personaId);
      if (correoExists) {
        throw new ConflictException('El correo electrónico ya está registrado para otra persona.');
      }
    }

    // 8. Actualizar docente llamando al repositorio
    const activeCargo = docente.docenteCargos?.[0];
    return this.teachersRepository.updateDocenteWithTransaction(
      id,
      dto,
      activeCargo,
      docente.personaId
    );
  }

  async bajaDocente(
    id: string,
    currentUser: { id: string; role: string; colegio_id?: string; institucion_id?: string }
  ) {
    // 1. Control de accesos por rol
    if (
      currentUser.role !== RoleCode.DIRECTOR_INSTITUCION &&
      currentUser.role !== RoleCode.JEFE_AREA
    ) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Buscar el docente
    const docente = await this.teachersRepository.findDocenteById(id);
    if (!docente) {
      throw new NotFoundException('El docente especificado no existe.');
    }

    // 3. Si es Director de IE, validar pertenencia y no dejar dar de baja a Directores o Coordinadores Pedagógicos
    if (currentUser.role === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException('El director de IE no tiene una institución educativa asignada en su token.');
      }
      if (docente.institucionId !== userInstitucionId) {
        throw new ForbiddenException('No tiene permisos para dar de baja a un docente de otra institución educativa.');
      }
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.teachersRepository.findCargoById(activeCargoObj.cargoId);
        if (currentCargo && (currentCargo.nombre === 'Director' || currentCargo.nombre === 'Coordinador Pedagógico')) {
          throw new ForbiddenException('El Director de I.E. no puede dar de baja a un Director o Coordinador Pedagógico.');
        }
      }
    }

    // 4. Si es Jefe de Área, validar que el docente a dar de baja sea Director o Coordinador Pedagógico
    if (currentUser.role === RoleCode.JEFE_AREA) {
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.teachersRepository.findCargoById(activeCargoObj.cargoId);
        if (currentCargo && currentCargo.nombre !== 'Director' && currentCargo.nombre !== 'Coordinador Pedagógico') {
          throw new ForbiddenException('El Jefe de Área solo puede dar de baja a directores y coordinadores pedagógicos.');
        }
      }
    }

    // 5. Cambiar el estado a Inactivo a través del repositorio
    const updatedDocente = await this.teachersRepository.updateDocenteEstado(id, 'Inactivo');

    return {
      success: true,
      message: 'Docente dado de baja correctamente.',
      docente: {
        id: updatedDocente.id,
        estado: updatedDocente.estado,
        persona: {
          dni: updatedDocente.persona.dni,
          nombres: updatedDocente.persona.nombres,
          apellidos: updatedDocente.persona.apellidos,
        },
      },
    };
  }
}
