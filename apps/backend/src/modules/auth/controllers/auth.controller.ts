import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { AllowFirstLogin } from '../decorators/allow-first-login.decorator.js';
import { ILoginResponse, IChangePasswordResponse, IForgotPasswordResponse, IResetPasswordResponse, ILogoutResponse } from '@sistema-monitoreo/shared-contracts';

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
  @UseGuards(AuthGuard, RolesGuard)
  @AllowFirstLogin()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ): Promise<IChangePasswordResponse> {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * POST /api/auth/forgot-password
   * Valida DNI e email del usuario y genera un token de recuperación seguro.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<IForgotPasswordResponse> {
    return this.authService.forgotPassword(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * POST /api/auth/reset-password
   * Restablece la contraseña si el token es válido y no ha expirado.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<IResetPasswordResponse> {
    return this.authService.resetPassword(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * POST /api/auth/logout
   * Cierra de sesión manual e invalida la sesión activa.
   */
  @Post('logout')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowFirstLogin()
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any): Promise<ILogoutResponse> {
    const sessionJti = req.user.jti;
    const userId = req.user.sub;
    return this.authService.logout(sessionJti, userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
