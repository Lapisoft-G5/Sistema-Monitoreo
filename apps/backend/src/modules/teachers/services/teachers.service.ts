import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';
import { TeachersRepository, DocenteFilter, DocenteEntity } from '../repositories/teachers.repository.js';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';
import { JwtPayload } from '../../auth/services/auth-token.service.js';

/** Subset of JwtPayload fields required by this service. Exported for use in tests. */
export type CurrentUser = Pick<
  JwtPayload,
  'sub' | 'role' | 'permissions' | 'colegio_id' | 'institucion_id'
>;

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly catalogsRepository: CatalogsRepository,
  ) {}

  async createDocente(dto: CreateDocenteDto, currentUser: CurrentUser): Promise<DocenteEntity> {
    // 1. Control de accesos por permisos
    if (!currentUser.permissions?.includes('docentes:write')) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Si es Director de IE, validar tokens y que no sea otra institución
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException(
          'El director de IE no tiene una institución educativa asignada en su token.',
        );
      }
      if (dto.institucionId !== userInstitucionId) {
        throw new ForbiddenException(
          'No tiene permisos para registrar un docente en otra institución educativa.',
        );
      }
    }

    // 3. Validar existencia de la institución educativa
    const institucion = await this.catalogsRepository.findInstitucionById(dto.institucionId);
    if (!institucion) {
      throw new NotFoundException('La institución educativa especificada no existe.');
    }

    // 4. Validar existencia del cargo
    const cargo = await this.catalogsRepository.findCargoById(dto.cargoId);
    if (!cargo) {
      throw new NotFoundException('El cargo especificado no existe.');
    }

    // 5. Si es Director de IE, validar que no intente asignar Director o Coordinador Pedagógico
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      if (cargo.nombre === CargoNombre.DIRECTOR || cargo.nombre === CargoNombre.COORDINADOR_PEDAGOGICO) {
        throw new ForbiddenException(
          'El Director de I.E. no puede asignar el cargo de Director o Coordinador Pedagógico.',
        );
      }
    }

    // 6. Si es Jefe de Área, validar que solo pueda registrar cargos Director o Coordinador Pedagógico
    if ((currentUser.role as RoleCode) === RoleCode.JEFE_AREA) {
      if (cargo.nombre !== CargoNombre.DIRECTOR && cargo.nombre !== CargoNombre.COORDINADOR_PEDAGOGICO) {
        throw new ForbiddenException(
          'El Jefe de Área solo puede registrar directores y coordinadores pedagógicos.',
        );
      }
    }

    // 7. Crear el docente llamando al repositorio
    return this.teachersRepository.createDocenteWithTransaction(dto);
  }

  async getDocentes(currentUser: CurrentUser): Promise<DocenteEntity[]> {
    // 1. Control de accesos por permisos
    if (!currentUser.permissions?.includes('docentes:read')) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Definir filtros según rol
    const filter: DocenteFilter = {};
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException(
          'El director de IE no tiene una institución educativa asignada en su token.',
        );
      }
      filter.institucionId = userInstitucionId;
    }

    // 3. Consultar docentes en el repositorio
    return this.teachersRepository.findDocentes(filter);
  }

  async updateDocente(id: string, dto: UpdateDocenteDto, currentUser: CurrentUser): Promise<DocenteEntity> {
    // 1. Control de accesos por permisos
    if (!currentUser.permissions?.includes('docentes:write')) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Buscar el docente con su persona y cargo activo
    const docente = await this.teachersRepository.findDocenteById(id);
    if (!docente) {
      throw new NotFoundException('El docente especificado no existe.');
    }

    // 3. Si es Director de IE, validar pertenencia
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException(
          'El director de IE no tiene una institución educativa asignada en su token.',
        );
      }
      if (docente.institucionId !== userInstitucionId) {
        throw new ForbiddenException(
          'No tiene permisos para editar un docente de otra institución educativa.',
        );
      }
    }

    // 4. Validar que el cargo exista
    const cargo = await this.catalogsRepository.findCargoById(dto.cargoId);
    if (!cargo) {
      throw new NotFoundException('El cargo especificado no existe.');
    }

    // 5. Si es Director de IE, validar que no intente asignar Director o Coordinador Pedagógico
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      if (cargo.nombre === CargoNombre.DIRECTOR || cargo.nombre === CargoNombre.COORDINADOR_PEDAGOGICO) {
        throw new ForbiddenException(
          'El Director de I.E. no puede asignar el cargo de Director o Coordinador Pedagógico.',
        );
      }
    }

    // 6. Si es Jefe de Área, validar que el cargo a asignar y el cargo actual sean de Director o Coordinador Pedagógico
    if ((currentUser.role as RoleCode) === RoleCode.JEFE_AREA) {
      if (cargo.nombre !== CargoNombre.DIRECTOR && cargo.nombre !== CargoNombre.COORDINADOR_PEDAGOGICO) {
        throw new ForbiddenException(
          'El Jefe de Área solo puede asignar el cargo de Director o Coordinador Pedagógico.',
        );
      }
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.catalogsRepository.findCargoById(activeCargoObj.cargoId);
        if (
          currentCargo &&
          currentCargo.nombre !== CargoNombre.DIRECTOR &&
          currentCargo.nombre !== CargoNombre.COORDINADOR_PEDAGOGICO
        ) {
          throw new ForbiddenException(
            'El Jefe de Área solo puede gestionar directores y coordinadores pedagógicos.',
          );
        }
      }
    }

    // 7. Validar que el correo no esté duplicado por otra persona
    if (dto.correo) {
      const emailInUse = await this.catalogsRepository.findPersonaByEmailNotId(
        dto.correo,
        docente.personaId,
      );
      if (emailInUse) {
        throw new ConflictException('El correo electrónico ya está registrado para otra persona.');
      }
    }

    // 8. Actualizar docente llamando al repositorio
    const activeCargo = docente.docenteCargos?.[0] || null;
    return this.teachersRepository.updateDocenteWithTransaction(
      id,
      dto,
      activeCargo,
      docente.personaId,
    );
  }

  async bajaDocente(
    id: string,
    currentUser: CurrentUser,
  ): Promise<{
    success: boolean;
    message: string;
    docente: { id: string; estado: string; persona: { dni: string; nombres: string; apellidos: string } };
  }> {
    // 1. Control de accesos por permisos
    if (!currentUser.permissions?.includes('docentes:write')) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.');
    }

    // 2. Buscar el docente
    const docente = await this.teachersRepository.findDocenteById(id);
    if (!docente) {
      throw new NotFoundException('El docente especificado no existe.');
    }

    // 3. Si es Director de IE, validar pertenencia y no dejar dar de baja a Directores o Coordinadores Pedagógicos
    if ((currentUser.role as RoleCode) === RoleCode.DIRECTOR_INSTITUCION) {
      const userInstitucionId = currentUser.colegio_id || currentUser.institucion_id;
      if (!userInstitucionId) {
        throw new ForbiddenException(
          'El director de IE no tiene una institución educativa asignada en su token.',
        );
      }
      if (docente.institucionId !== userInstitucionId) {
        throw new ForbiddenException(
          'No tiene permisos para dar de baja a un docente de otra institución educativa.',
        );
      }
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.catalogsRepository.findCargoById(activeCargoObj.cargoId);
        if (
          currentCargo &&
          (currentCargo.nombre === CargoNombre.DIRECTOR || currentCargo.nombre === CargoNombre.COORDINADOR_PEDAGOGICO)
        ) {
          throw new ForbiddenException(
            'El Director de I.E. no puede dar de baja a un Director o Coordinador Pedagógico.',
          );
        }
      }
    }

    // 4. Si es Jefe de Área, validar que el docente a dar de baja sea Director o Coordinador Pedagógico
    if ((currentUser.role as RoleCode) === RoleCode.JEFE_AREA) {
      const activeCargoObj = docente.docenteCargos?.[0];
      if (activeCargoObj) {
        const currentCargo = await this.catalogsRepository.findCargoById(activeCargoObj.cargoId);
        if (
          currentCargo &&
          currentCargo.nombre !== CargoNombre.DIRECTOR &&
          currentCargo.nombre !== CargoNombre.COORDINADOR_PEDAGOGICO
        ) {
          throw new ForbiddenException(
            'El Jefe de Área solo puede dar de baja a directores y coordinadores pedagógicos.',
          );
        }
      }
    }

    // 5. Cambiar el estado a Inactivo a través del repositorio
    const updatedDocente = await this.teachersRepository.updateDocenteEstado(
      id,
      EstadoRegistro.INACTIVO,
    );

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
