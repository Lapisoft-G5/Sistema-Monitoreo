import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryPlantillaDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  anioAcademico?: number;

  @IsOptional()
  @IsString()
  @IsIn(['DOCENTE', 'DIRECTIVO'])
  tipoMonitoreo?: 'DOCENTE' | 'DIRECTIVO';

  @IsOptional()
  @IsString()
  @IsIn(['Borrador', 'Vigente', 'Historico'])
  estado?: 'Borrador' | 'Vigente' | 'Historico';
}
