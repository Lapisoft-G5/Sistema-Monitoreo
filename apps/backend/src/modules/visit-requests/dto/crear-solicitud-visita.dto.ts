import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type {
  ICrearSolicitudVisitaRequest,
  PrioridadVisita,
} from '@sistema-monitoreo/shared-contracts';

export class CrearSolicitudVisitaDto implements ICrearSolicitudVisitaRequest {
  @IsUUID()
  institucionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivo?: string;

  @IsOptional()
  @IsIn(['ALTA', 'NORMAL'])
  prioridad?: PrioridadVisita;
}

export class ResolverSolicitudVisitaDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;

  @IsOptional()
  @IsUUID()
  cronogramaId?: string;
}
