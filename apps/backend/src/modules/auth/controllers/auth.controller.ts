import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { ILoginResponse, IChangePasswordResponse } from '@sistema-monitoreo/shared-contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Valida credenciales, emite JWT y registra la sesión.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<ILoginResponse> {
    return this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * POST /api/auth/change-password
   * Actualiza la contraseña del usuario en su primer acceso y cambia su estado isFirstLogin a false.
   */
  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ): Promise<IChangePasswordResponse> {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, dto);
  }
}
