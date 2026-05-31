import { Injectable, NotImplementedException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository.js';
import { ILoginResponse } from '@sistema-monitoreo/shared-contracts';
import { LoginDto } from '../dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(dto: LoginDto): Promise<ILoginResponse> {
    // Scaffold for BE-AUTH-02 to complete
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.authRepository.findUserByEmail(dto.email);

    throw new NotImplementedException('Login logic is part of BE-AUTH-02');
  }
}
