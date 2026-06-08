import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ILoginRequest } from '@sistema-monitoreo/shared-contracts';

export class LoginDto implements ILoginRequest {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe contener solo números' })
  dni!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
