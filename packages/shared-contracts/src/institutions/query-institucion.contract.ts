import type { IInstitucionResponse } from './create-institucion.contract.js';

export interface IQueryInstitucionRequest {
  nombre?: string;
  nivelEducativo?: string;
  estado?: string;
  limit?: string | number;
  offset?: string | number;
}

export interface IInstitucionListResponse {
  data: IInstitucionResponse[];
  total: number;
  limit: number;
  offset: number;
}
