import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import type { ICreateEspecialistaRequest } from '@sistema-monitoreo/shared-contracts';

export class CreateEspecialistaDto implements ICreateEspecialistaRequest {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 caracteres' })
  dni!: string;

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
  rolCode!: string;
}
