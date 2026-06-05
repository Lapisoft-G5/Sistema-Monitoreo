import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
}
