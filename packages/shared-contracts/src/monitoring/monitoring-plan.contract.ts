export interface IMonitoringPlanResponse {
  id: string;
  titulo: string;
  anioAcademico: number;
  tipoEntidad: string;
  archivoUrl: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  autorId?: string;
  autorNombre?: string;
  rolAutorAlCrear?: string;
  institucionId?: string | null;
  deleted?: boolean;
  deletedAt?: string | null;
  institucionesCubiertas?: IPlanInstitucionCubierta[];
  institucion?: {
    nombre: string;
    codigoModular: string;
  };
}

export interface IPlanInstitucionCubierta {
  institucionId: string;
  institucionNombre: string;
  institucionCodigoModular: string;
}

export interface ICreateMonitoringPlanRequest {
  titulo: string;
  anioAcademico: number;
  tipoEntidad: string;
  institucionId?: string;
}
