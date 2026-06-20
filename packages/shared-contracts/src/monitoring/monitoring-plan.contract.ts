export interface IMonitoringPlanResponse {
  id: string;
  titulo: string;
  anioAcademico: number;
  tipoEntidad: string;
  archivoUrl: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMonitoringPlanRequest {
  titulo: string;
  anioAcademico: number;
  tipoEntidad: string;
}
