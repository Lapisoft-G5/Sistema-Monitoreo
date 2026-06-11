import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomBytes, createHash } from 'node:crypto';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { Prisma } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  sub: string;
  dni: string;
  role: string;
  permissions?: string[];
  nombres: string;
  apellidos: string;
  institucion_id?: string;
  colegio_id?: string;
  firstLogin: boolean;
}

export type AuthUserWithRelations = Prisma.UsuarioGetPayload<{
  include: {
    rol: {
      include: {
        rolPermisos: {
          include: {
            permiso: true;
          };
        };
      };
    };
    persona: {
      include: {
        docente: {
          include: {
            docenteCargos: {
              include: { cargo: true };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateTokens(
    payload: JwtPayload,
    sessionJti: string,
  ): {
    accessToken: string;
    refreshTokenJWT: string;
    refreshExpiresAt: Date;
  } {
    const accessOpts: JwtSignOptions = {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as JwtSignOptions['expiresIn'],
      jwtid: sessionJti,
    };
    const accessToken = this.jwtService.sign(
      payload as unknown as Record<string, unknown>,
      accessOpts,
    );

    const rawRefreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshOpts: JwtSignOptions = {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'],
    };
    const refreshTokenJWT = this.jwtService.sign(
      { jti: sessionJti, sub: payload.sub, tokenHash: refreshTokenHash },
      refreshOpts,
    );

    const decodedRefresh = this.jwtService.decode<{ exp: number }>(refreshTokenJWT);
    const refreshExpiresAt = new Date(decodedRefresh.exp * 1000);

    return { accessToken, refreshTokenJWT, refreshExpiresAt };
  }

  verifyRefreshToken(token: string): { jti: string; sub: string; tokenHash: string; exp: number } {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET as string,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  buildJwtPayload(user: AuthUserWithRelations): JwtPayload {
    let institucion_id: string | undefined;
    let colegio_id: string | undefined;

    if ((user.rol.codigo as RoleCode) === RoleCode.DIRECTOR_INSTITUCION && user.persona.docente) {
      const cargoDirector = user.persona.docente.docenteCargos?.find(
        (dc) => (dc.cargo.nombre as CargoNombre) === CargoNombre.DIRECTOR && !dc.fechaFin,
      );
      if (cargoDirector) {
        colegio_id = user.persona.docente.institucionId;
      }
    }

    const permissions = user.rol.rolPermisos?.map((rp) => rp.permiso.codigo) || [];

    return {
      sub: user.id,
      dni: user.persona.dni,
      role: user.rol.codigo,
      permissions,
      nombres: user.persona.nombres,
      apellidos: user.persona.apellidos,
      institucion_id,
      colegio_id,
      firstLogin: user.isFirstLogin,
    };
  }
}
