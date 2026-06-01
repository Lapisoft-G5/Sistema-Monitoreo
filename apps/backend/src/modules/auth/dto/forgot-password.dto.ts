import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IForgotPasswordRequest } from '@sistema-monitoreo/shared-contracts';

export class ForgotPasswordDto implements IForgotPasswordRequest {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe contener solo números' })
  dni!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty()
  email!: string;
}
