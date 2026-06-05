import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, IsUUID } from 'class-validator';
import { ICreateDocenteRequest } from '@sistema-monitoreo/shared-contracts';

export class CreateDocenteDto implements ICreateDocenteRequest {
  @IsString()
  @IsNotEmpty({ message: 'El DNI es requerido' })
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe contener solo números' })
  dni!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(120, { message: 'El nombre no puede exceder los 120 caracteres' })
  nombres!: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MaxLength(120, { message: 'Los apellidos no pueden exceder los 120 caracteres' })
  apellidos!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(255, { message: 'El correo electrónico no puede exceder los 255 caracteres' })
  correo?: string;

  @IsUUID('4', { message: 'El ID de la institución debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID de la institución es requerido' })
  institucionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El grado académico no puede exceder los 50 caracteres' })
  gradoAcademico?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nivel educativo es requerido' })
  @MaxLength(50, { message: 'El nivel educativo no puede exceder los 50 caracteres' })
  nivelEducativo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'El curso asignado no puede exceder los 150 caracteres' })
  cursoAsignado?: string;

  @IsUUID('4', { message: 'El ID del cargo debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID del cargo es requerido' })
  cargoId!: string;
}
