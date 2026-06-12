import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import type { IUpdateJefeAreaRequest } from '@sistema-monitoreo/shared-contracts';

export class UpdateJefeAreaDto implements IUpdateJefeAreaRequest {
  @IsString()
  @IsNotEmpty()
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  apellidos!: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsOptional()
  @IsString()
  @Length(9, 9, { message: 'El celular debe tener exactamente 9 dígitos' })
  @Matches(/^\d{9}$/, { message: 'El celular debe contener solo números' })
  telefono?: string;

  @IsInt()
  @IsNotEmpty()
  cargaHoraria!: number;

  @IsString()
  @IsNotEmpty()
  nivelEducativo!: string;

  @IsString()
  @IsNotEmpty()
  estado!: string;

  @IsString()
  @IsNotEmpty()
  rolCode!: string;
}
