import type { IQueryEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';
export declare class QueryEspecialistaDto implements IQueryEspecialistaRequest {
  estado?: string;
  especialidad?: string;
  nivelEducativo?: string;
  cargo?: string;
}
