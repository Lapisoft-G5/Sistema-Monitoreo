import { IsOptional, IsString } from 'class-validator';
import type { IQueryJefeAreaRequest } from '@sistema-monitoreo/shared-contracts';

export class QueryJefeAreaDto implements IQueryJefeAreaRequest {
  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  nivelEducativo?: string;
}
