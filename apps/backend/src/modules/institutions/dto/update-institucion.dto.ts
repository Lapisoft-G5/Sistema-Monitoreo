import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { IUpdateInstitucionRequest } from '@sistema-monitoreo/shared-contracts';

export class UpdateInstitucionDto implements IUpdateInstitucionRequest {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El nivel educativo no puede estar vacío' })
  nivelEducativo?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El departamento no puede estar vacío' })
  departamento?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'La provincia no puede estar vacía' })
  provincia?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El distrito no puede estar vacío' })
  distrito?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  direccion?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'La zona no puede estar vacía' })
  zona?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  estado?: string;
}
