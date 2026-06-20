export type TipoPlantilla = 'DOCENTE' | 'DIRECTIVO';

export type EstadoPlantilla = 'BORRADOR' | 'VIGENTE' | 'HISTORICO';

export type NivelRomano = 'I' | 'II' | 'III' | 'IV';

export type Baremo = 'VIGENTE' | 'PORCENTUAL';

export type ModoVersionado = 'IN_PLACE' | 'VERSIONADO';

export type RolAutorPlantilla = 'jefe_gestion' | 'director_ie';

export interface INivelCalificacion {
  id: string;
  plantillaId: string;
  nivelRomano: NivelRomano;
  denominacion: string;
  rangoMin: number;
  color: string;
  orden: number;
}

export interface IAspecto {
  id: string;
  desempenoId: string;
  descripcion: string;
  orden: number;
}

export interface IRubricaNivel {
  id: string;
  desempenoId: string;
  nivelCalificacionId: string;
  nivelRomano: NivelRomano;
  descripcion: string;
}

export interface IDesempeno {
  id: string;
  plantillaId: string;
  nombre: string;
  descripcionCorta: string | null;
  orden: number;
  aspectos: IAspecto[];
  rubrica: IRubricaNivel[];
}

export interface IPlantilla {
  id: string;
  tipoMonitoreo: TipoPlantilla;
  anioAcademico: number;
  version: number;
  baremo: Baremo;
  descripcion: string | null;
  estado: EstadoPlantilla;
  autorId: string;
  rolAutorAlCrear: RolAutorPlantilla;
  institucionId: string | null;
  niveles: INivelCalificacion[];
  desempenos: IDesempeno[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePlantillaRequest {
  tipoMonitoreo: TipoPlantilla;
  anioAcademico: number;
  baremo: Baremo;
  descripcion?: string;
  niveles: Omit<INivelCalificacion, 'id' | 'plantillaId'>[];
  desempenos: {
    id: string;
    nombre: string;
    descripcionCorta?: string;
    orden: number;
    aspectos: { id: string; descripcion: string; orden: number }[];
    rubrica: {
      nivelCalificacionId: string;
      nivelRomano: NivelRomano;
      descripcion: string;
    }[];
  }[];
}

export interface IUpdatePlantillaRequest {
  baremo?: Baremo;
  descripcion?: string;
  niveles?: Omit<INivelCalificacion, 'id' | 'plantillaId'>[];
  desempenos?: {
    id: string;
    nombre: string;
    descripcionCorta?: string;
    orden: number;
    aspectos: { id: string; descripcion: string; orden: number }[];
    rubrica: {
      nivelCalificacionId: string;
      nivelRomano: NivelRomano;
      descripcion: string;
    }[];
  }[];
}

export interface IUpdatePlantillaResponse {
  id: string;
  version: number;
  modo: ModoVersionado;
  mensaje: string;
  plantilla: IPlantilla;
}

export interface IPatchEstadoPlantillaRequest {
  estado: EstadoPlantilla;
}

export interface IDuplicatePlantillaRequest {
  descripcion?: string;
}

export interface IQueryPlantillas {
  tipoMonitoreo?: TipoPlantilla;
  anioAcademico?: number;
  estado?: EstadoPlantilla;
  soloVigentes?: boolean;
}
