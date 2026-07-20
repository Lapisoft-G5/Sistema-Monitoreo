import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type {
  DestinatarioAlerta,
  ICrearAlertaInstitucionRequest,
} from '@sistema-monitoreo/shared-contracts';

export class CrearAlertaInstitucionDto implements ICrearAlertaInstitucionRequest {
  @IsUUID()
  institucionId!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Debe indicar al menos un destinatario' })
  @IsIn(['director_ie', 'jefe_gestion'], { each: true })
  destinatarios!: DestinatarioAlerta[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensaje?: string;
}
