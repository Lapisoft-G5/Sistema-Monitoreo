import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { IUpdatePerfilRequest } from '@sistema-monitoreo/shared-contracts';

export class UpdatePerfilDto implements IUpdatePerfilRequest {
  @ApiPropertyOptional({
    description: 'Correo electrónico personal o institucional',
    example: 'martha.villasante@ugel-lampa.gob.pe',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(255, { message: 'El correo electrónico no puede exceder 255 caracteres' })
  correo?: string | null;

  @ApiPropertyOptional({
    description: 'Número de celular (9 dígitos)',
    example: '987654321',
  })
  @IsOptional()
  @IsString()
  @Matches(/^9\d{8}$/, {
    message: 'El número de celular debe tener exactamente 9 dígitos numéricos y comenzar con 9',
  })
  telefono?: string | null;
}
