import type { IPlantilla } from '@sistema-monitoreo/shared-contracts';
import type {
  CreatePlantillaDto,
  DesempenoInput,
  NivelCalificacionInput,
} from '../dto/create-plantilla.dto.js';
import type { UpdatePlantillaDto } from '../dto/update-plantilla.dto.js';

export interface CreatePlantillaData {
  autorId: string;
  rolAutorAlCrear: 'jefe_gestion' | 'director_ie';
  institucionId: string | null;
  data: CreatePlantillaDto;
}

export interface UpdatePlantillaData {
  data: UpdatePlantillaDto;
}

export type ModoVersionado = 'IN_PLACE' | 'VERSIONADO';

export interface UpdatePlantillaResult {
  plantilla: IPlantilla;
  modo: ModoVersionado;
  mensaje: string;
}

export abstract class PlantillaRepository {
  abstract findAll(filters?: {
    search?: string;
    anioAcademico?: number;
    tipoMonitoreo?: 'DOCENTE' | 'DIRECTIVO';
    estado?: 'Borrador' | 'Vigente' | 'Historico';
  }): Promise<IPlantilla[]>;

  abstract findById(id: string): Promise<IPlantilla | null>;

  abstract countFichasAsociadas(plantillaId: string): Promise<number>;

  abstract create(data: CreatePlantillaData): Promise<IPlantilla>;

  abstract updateInPlace(
    plantillaId: string,
    data: UpdatePlantillaData,
  ): Promise<IPlantilla>;

  abstract versionarConClon(
    plantillaOriginalId: string,
    data: UpdatePlantillaData,
    nuevoAutorId: string,
  ): Promise<IPlantilla>;

  abstract updateEstado(
    id: string,
    estado: 'Borrador' | 'Vigente' | 'Historico',
  ): Promise<IPlantilla>;

  abstract clone(
    sourceId: string,
    nuevoAutorId: string,
    rolAutorAlCrear: 'jefe_gestion' | 'director_ie',
    institucionId: string | null,
    descripcion?: string,
  ): Promise<IPlantilla>;
}
