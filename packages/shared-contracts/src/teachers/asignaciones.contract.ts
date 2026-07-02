export interface IAsignarEvaluadorRequest {
  evaluadoIds: string[];
}

export interface IAsignacionEvaluadorResponse {
  id: string;
  evaluadorId: string;
  evaluadoId: string;
  fechaInicio: Date | string;
  fechaFin: Date | string | null;
  isActive: boolean;
  evaluador?: {
    id: string;
    persona: {
      nombres: string;
      apellidos: string;
    };
  };
  evaluado?: {
    id: string;
    persona: {
      nombres: string;
      apellidos: string;
    };
  };
}

export interface IAsignacionEvaluadorListResponse {
  data: IAsignacionEvaluadorResponse[];
}
