import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { AllowFirstLogin } from '../decorators/allow-first-login.decorator.js';
import {
  ILoginResponse,
  IChangePasswordResponse,
  IForgotPasswordResponse,
  IResetPasswordResponse,
  ILogoutResponse,
  IRefreshTokenResponse,
} from '@sistema-monitoreo/shared-contracts';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Valida credenciales, emite JWT y registra la sesión.
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 intentos por minuto
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<ILoginResponse> {
    const result = await this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return result;
  }

  /**
   * POST /api/auth/refresh
   * Emite un nuevo access token a partir de un refresh token válido.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<IRefreshTokenResponse> {
    const refreshTokenToUse = req.cookies?.refreshToken || dto.refreshToken;
    const result = await this.authService.refreshToken({ refreshToken: refreshTokenToUse }, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return result;
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<IChangePasswordResponse> {
    const userId = req.user.sub;
    const sessionJti = req.user.jti;
    const result = await this.authService.changePassword(userId, sessionJti, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return result;
  }

  /**
   * POST /api/auth/forgot-password
   * Valida DNI e email del usuario y genera un token de recuperación seguro.
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 intentos por minuto
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
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 intentos por minuto
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
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response): Promise<ILogoutResponse> {
    const sessionJti = req.user.jti;
    const userId = req.user.sub;
    const result = await this.authService.logout(sessionJti, userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return result;
  }

  private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
    const isProd = process.env.NODE_ENV === 'production';
    
    if (accessToken) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });
    }

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });
    }
  }
}
