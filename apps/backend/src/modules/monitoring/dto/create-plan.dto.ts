import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  anioAcademico!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  archivoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipoEntidad?: string;

  @IsOptional()
  @IsUUID()
  institucionId?: string;
}
