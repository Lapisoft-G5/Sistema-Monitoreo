import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CargoNombre } from '../../../shared/auth/capability-map.js';

export class AddDocenteCargoDto {
  @IsEnum(CargoNombre, {
    message: `cargo debe ser uno de: ${Object.values(CargoNombre).join(', ')}`,
  })
  cargo!: CargoNombre;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;
}

export class FinalizeDocenteCargoDto {
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class ListDocenteCargosQuery {
  @IsOptional()
  @IsUUID()
  docenteId?: string;
}
