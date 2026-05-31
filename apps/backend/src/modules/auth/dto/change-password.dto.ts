import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { IChangePasswordRequest } from '@sistema-monitoreo/shared-contracts';

export class ChangePasswordDto implements IChangePasswordRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  newPassword!: string;
}
