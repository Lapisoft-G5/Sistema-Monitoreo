import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EspecialistaCargoEnum } from '../../../shared/auth/capability-map.js';

export class AddEspecialistaCargoDto {
  @IsEnum(EspecialistaCargoEnum, {
    message: `cargo debe ser uno de: ${Object.values(EspecialistaCargoEnum).join(', ')}`,
  })
  cargo!: EspecialistaCargoEnum;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;
}

export class FinalizeEspecialistaCargoDto {
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
