import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ILoginRequest } from '@sistema-monitoreo/shared-contracts';

export class LoginDto implements ILoginRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
