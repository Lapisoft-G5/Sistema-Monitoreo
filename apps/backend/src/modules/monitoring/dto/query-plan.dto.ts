import { IsOptional, IsString, IsInt, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPlanDto {
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
  @IsIn(['UGEL', 'IE'])
  tipoEntidad?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  institucionId?: string;
}
