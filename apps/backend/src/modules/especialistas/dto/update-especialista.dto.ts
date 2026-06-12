import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import type { IUpdateEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';

export class UpdateEspecialistaDto implements IUpdateEspecialistaRequest {
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

  @IsString()
  @IsNotEmpty()
  especialidad!: string;

  @IsString()
  @IsNotEmpty()
  nivelEducativo!: string;

  @IsString()
  @IsNotEmpty()
  estado!: string;

  @IsString()
  @IsNotEmpty()
  rolCode!: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  condicionLaboral?: string;

  @IsInt()
  @IsOptional()
  cargaLaboral?: number;

  @IsInt()
  @IsOptional()
  escalaMagisterial?: number | null;
}

