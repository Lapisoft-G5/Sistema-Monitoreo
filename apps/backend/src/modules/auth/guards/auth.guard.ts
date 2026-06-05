import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ALLOW_FIRST_LOGIN_KEY } from '../decorators/allow-first-login.decorator.js';
import { AuthRepository } from '../repositories/auth.repository.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;

      // Verificar que la sesión del JWT esté activa en BD (evita tokens de sesiones cerradas)
      const isSessionActive = await this.authRepository.isSessionActive(payload.jti);
      if (!isSessionActive) {
        throw new UnauthorizedException('Sesión invalidada o cerrada');
      }

      // Detectar primer acceso y forzar cambio de contraseña temporal
      if (payload.firstLogin === true) {
        const allowFirstLogin = this.reflector.getAllAndOverride<boolean>(
          ALLOW_FIRST_LOGIN_KEY,
          [context.getHandler(), context.getClass()],
        );
        if (!allowFirstLogin) {
          throw new ForbiddenException(
            'Debe cambiar su contraseña temporal antes de acceder a otros recursos.',
          );
        }
      }
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
