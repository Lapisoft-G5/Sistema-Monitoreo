import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSolicitudReprogramacionDto {
  @IsUUID()
  cronogramaId!: string;

  @IsDateString()
  fechaPropuesta!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  horaPropuesta!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  justificacion!: string;

  @IsOptional()
  @IsString()
  archivoSustentoBase64?: string;

  @IsOptional()
  @IsString()
  archivoSustentoNombre?: string;
}

export class ResolverSolicitudDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comentario!: string;

  @IsOptional()
  @IsIn(['APROBAR', 'RECHAZAR'])
  accion?: 'APROBAR' | 'RECHAZAR';
}
