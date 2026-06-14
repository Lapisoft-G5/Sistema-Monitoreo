import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthSessionService } from '../services/auth-session.service.js';
import { AuthPasswordService } from '../services/auth-password.service.js';
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
import { JwtPayload } from '../services/auth-token.service.js';

interface AuthenticatedRequest extends Request {
  cookies: Record<string, string>;
  user: JwtPayload & { jti: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly authPasswordService: AuthPasswordService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ILoginResponse> {
    const result = await this.authSessionService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IRefreshTokenResponse> {
    const refreshTokenToUse = req.cookies?.refreshToken || dto.refreshToken;
    const result = await this.authSessionService.refreshToken(
      { refreshToken: refreshTokenToUse },
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return result;
  }

  @Post('change-password')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowFirstLogin()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IChangePasswordResponse> {
    const userId = req.user.sub;
    const sessionJti = req.user.jti;
    const result = await this.authPasswordService.changePassword(userId, sessionJti, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const cookieOpts = this.getCookieOptions();
    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);

    return result;
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<IForgotPasswordResponse> {
    return this.authPasswordService.forgotPassword(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<IResetPasswordResponse> {
    return this.authPasswordService.resetPassword(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowFirstLogin()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ILogoutResponse> {
    const sessionJti = req.user.jti;
    const userId = req.user.sub;
    const result = await this.authSessionService.logout(userId, sessionJti, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const cookieOpts = this.getCookieOptions();
    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);

    return result;
  }

  private getCookieOptions(maxAge?: number) {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'strict') as 'none' | 'strict' | 'lax',
      ...(maxAge !== undefined ? { maxAge } : {}),
    };
  }

  private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
    if (accessToken) {
      res.cookie('accessToken', accessToken, this.getCookieOptions(15 * 60 * 1000));
    }

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, this.getCookieOptions(7 * 24 * 60 * 60 * 1000));
    }
  }
}
