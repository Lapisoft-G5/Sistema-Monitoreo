import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { AuthTokenService, AuthUserWithRelations } from './auth-token.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import {
  ILoginResponse,
  ILogoutResponse,
  IRefreshTokenResponse,
} from '@sistema-monitoreo/shared-contracts';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly auditRepository: AuditRepository,
    private readonly tokenService: AuthTokenService,
  ) {}

  async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<ILoginResponse> {
    const now = new Date();
    const user = await this.userRepository.findUserByDni(dto.dni);

    if (!user) {
      await this.auditRepository.logAuthEvent({
        eventType: 'LOGIN_FAILURE_UNREGISTERED',
        eventDetail: `Intento fallido para DNI: ${dto.dni}`,
        ...meta,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      await this.auditRepository.logAuthEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE_INACTIVE',
        eventDetail: `Cuenta inactiva`,
        ...meta,
      });
      throw new ForbiddenException('Cuenta inactiva');
    }

    if (user.lockedUntil && user.lockedUntil > now) {
      await this.auditRepository.logAuthEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE_LOCKED',
        ...meta,
      });
      throw new ForbiddenException({
        message: 'Cuenta bloqueada temporalmente. Intente más tarde.',
        lockedUntil: user.lockedUntil.toISOString(),
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      if (user.lockedUntil && user.lockedUntil <= now) {
        await this.userRepository.resetFailedAttempts(user.id);
      }
      const updatedAttempts = await this.userRepository.incrementFailedAttempts(user.id, now);
      if (updatedAttempts >= 3) {
        const lockUntil = new Date(now.getTime() + 15 * 60 * 1000);
        await this.userRepository.lockAccount(user.id, lockUntil);
        await this.auditRepository.logAuthEvent({
          userId: user.id,
          eventType: 'ACCOUNT_LOCKED',
          ...meta,
        });
      } else {
        await this.auditRepository.logAuthEvent({
          userId: user.id,
          eventType: 'LOGIN_FAILURE_PASSWORD',
          ...meta,
        });
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.userRepository.resetFailedAttempts(user.id);
    const sessionJti = randomUUID();
    const payload = this.tokenService.buildJwtPayload(user as unknown as AuthUserWithRelations);
    const tokens = this.tokenService.generateTokens(payload, sessionJti);

    await this.sessionRepository.createSession({
      userId: user.id,
      sessionJti,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      expiresAt: tokens.refreshExpiresAt,
    });

    await this.userRepository.updateLastLogin(user.id, now);
    await this.auditRepository.logAuthEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      ...meta,
    });

    const userResponse = {
      id: payload.sub,
      dni: payload.dni,
      nombres: payload.nombres,
      apellidos: payload.apellidos,
      role: payload.role,
      institucion: payload.institucion_id || payload.colegio_id,
      institucionNombre: payload.colegio_nombre,
      institucionNivel: payload.colegio_nivel,
      especialistaNivel: payload.especialista_nivel,
      especialistaModalidad: payload.especialista_modalidad,
      firstLogin: payload.firstLogin,
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshTokenJWT,
      user: userResponse,
    };
  }

  async logout(
    userId: string,
    sessionJti: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<ILogoutResponse> {
    await this.sessionRepository.invalidateSession(sessionJti, 'USER_LOGOUT');
    await this.auditRepository.logAuthEvent({ userId, eventType: 'LOGOUT', ...meta });
    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  async refreshToken(
    dto: RefreshTokenDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<IRefreshTokenResponse> {
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    const isSessionActive = await this.sessionRepository.isSessionActive(payload.jti);

    if (!isSessionActive) {
      await this.auditRepository.logAuthEvent({
        userId: payload.sub,
        eventType: 'REFRESH_TOKEN_FAILURE_INVALID_SESSION',
        ...meta,
      });
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const user = await this.userRepository.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }

    const newJwtPayload = this.tokenService.buildJwtPayload(
      user as unknown as AuthUserWithRelations,
    );
    const newTokens = this.tokenService.generateTokens(newJwtPayload, payload.jti);

    await this.auditRepository.logAuthEvent({
      userId: user.id,
      eventType: 'TOKEN_REFRESHED',
      ...meta,
    });
    return { accessToken: newTokens.accessToken, refreshToken: newTokens.refreshTokenJWT };
  }
}
