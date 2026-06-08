import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'node:crypto';
import { RoleCode } from '../../../common/enums/role.enum.js';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateTokens(payload: any, sessionJti: string) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET as string,
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      jwtid: sessionJti,
    });

    const rawRefreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshTokenJWT = this.jwtService.sign(
      { jti: sessionJti, sub: payload.sub, tokenHash: refreshTokenHash },
      {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      },
    );

    const decodedRefresh = this.jwtService.decode(refreshTokenJWT) as any;
    const refreshExpiresAt = new Date(decodedRefresh.exp * 1000);

    return { accessToken, refreshTokenJWT, refreshExpiresAt };
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET as string });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  buildJwtPayload(user: any) {
    let institucion_id: string | undefined;
    let colegio_id: string | undefined;

    if (user.role.code === RoleCode.DIRECTOR_INSTITUCION && user.persona.docente) {
      const cargoDirector = user.persona.docente.docenteCargos?.find(
        (dc: any) => dc.cargo.nombre === 'Director' && !dc.fechaFin,
      );
      if (cargoDirector) {
        colegio_id = user.persona.docente.institucionId;
      }
    }

    return {
      sub: user.id,
      dni: user.persona.dni,
      role: user.role.code,
      nombres: user.persona.nombres,
      apellidos: user.persona.apellidos,
      institucion_id,
      colegio_id,
      firstLogin: user.isFirstLogin,
    };
  }
}
