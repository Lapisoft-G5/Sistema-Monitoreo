import { IsNotEmpty, IsString, IsInt, IsIn, MaxLength, Min } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  @IsIn(['UGEL', 'IE'])
  tipoEntidad!: string;
}
