import { IsNotEmpty, IsString } from 'class-validator';
import type { IRefreshTokenRequest } from '@sistema-monitoreo/shared-contracts';

export class RefreshTokenDto implements IRefreshTokenRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
