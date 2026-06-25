import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { IPlantilla } from '@sistema-monitoreo/shared-contracts';
import type { CreatePlantillaDto } from '../dto/create-plantilla.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

export function validarReglas(dto: CreatePlantillaDto): void {
  const nivelesSet = new Set(dto.niveles.map((n) => n.nivelRomano));
  if (nivelesSet.size !== 4) {
    throw new BadRequestException(
      'La plantilla debe tener exactamente 4 niveles (I, II, III, IV).',
    );
  }
  for (const d of dto.desempenos) {
    const rubricaSet = new Set(d.rubrica.map((r) => r.nivelRomano));
    if (rubricaSet.size !== 4) {
      throw new BadRequestException(
        `El desempeno "${d.nombre}" debe tener rubrica para los 4 niveles (I, II, III, IV).`,
      );
    }
  }
}

function isDirector(session: SessionUser): boolean {
  return session.role === RoleCode.DIRECTOR_INSTITUCION;
}

export function resolveAutor(session: SessionUser): {
  rolAutorAlCrear: 'jefe_gestion' | 'director_ie';
  institucionId: string | null;
} {
  if (isDirector(session)) {
    return {
      rolAutorAlCrear: 'director_ie',
      institucionId: session.institucionId ?? null,
    };
  }
  return { rolAutorAlCrear: 'jefe_gestion', institucionId: null };
}

export function guardVisibilidad(plantilla: IPlantilla, session?: SessionUser): void {
  if (!session) return;
}

export function guardModificacion(plantilla: IPlantilla, session: SessionUser): void {
  if (isDirector(session) && plantilla.rolAutorAlCrear === 'jefe_gestion') {
    throw new ForbiddenException('Los Directores IE no pueden modificar plantillas UGEL.');
  }
}
