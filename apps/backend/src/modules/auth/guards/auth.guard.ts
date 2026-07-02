import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { JwtPayload } from '../services/auth-token.service.js';
import { ALLOW_FIRST_LOGIN_KEY } from '../decorators/allow-first-login.decorator.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { RlsGucService } from '../services/rls-guc.service.js';

interface AuthenticatedRequest extends Request {
  cookies: Record<string, string>;
  user?: JwtPayload & { jti: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly sessionRepository: SessionRepository,
    private readonly rlsGucService: RlsGucService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.accessToken || this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload & { jti: string }>(token);
      request.user = payload;

      // Verificar que la sesión del JWT esté activa en BD (evita tokens de sesiones cerradas)
      const isSessionActive = await this.sessionRepository.isSessionActive(payload.jti);
      if (!isSessionActive) {
        throw new UnauthorizedException('Sesión invalidada o cerrada');
      }

      // Detectar primer acceso y forzar cambio de contraseña temporal
      if (payload.firstLogin === true) {
        const allowFirstLogin = this.reflector.getAllAndOverride<boolean>(ALLOW_FIRST_LOGIN_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (!allowFirstLogin) {
          throw new ForbiddenException(
            'Debe cambiar su contraseña temporal antes de acceder a otros recursos.',
          );
        }
      }

      await this.rlsGucService.setSessionGucs(
        payload.sub,
        payload.role,
        payload.institucion_id ?? '',
      );
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
