import { IsOptional, IsString } from 'class-validator';
import type { IQueryEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';

export class QueryEspecialistaDto implements IQueryEspecialistaRequest {
  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsString()
  @IsOptional()
  nivelEducativo?: string;

  @IsString()
  @IsOptional()
  cargo?: string;
}
