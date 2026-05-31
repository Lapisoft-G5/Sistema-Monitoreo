import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { IResetPasswordRequest } from '@sistema-monitoreo/shared-contracts';

export class ResetPasswordDto implements IResetPasswordRequest {
  @IsString()
  @IsNotEmpty({ message: 'El token de recuperación es obligatorio' })
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  newPassword!: string;
}
