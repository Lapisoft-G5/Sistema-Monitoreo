import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomBytes, createHash } from 'node:crypto';
import { Prisma } from '../../../generated/prisma/client.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import {
  computeEffectivePermissions,
  CargoNombre,
  EspecialistaCargoEnum,
} from '../../../shared/auth/capability-map.js';

export interface JwtPayload {
  sub: string;
  dni: string;
  role: RoleCode;
  permissions?: string[];
  nombres: string;
  apellidos: string;
  institucion_id?: string;
  colegio_id?: string;
  colegio_nombre?: string;
  colegio_nivel?: string;
  especialista_nivel?: string;
  especialista_modalidad?: string;
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
            institucion: true;
            docenteCargos: {
              include: { cargo: true };
            };
          };
        };
        especialista: true;
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
    let colegio_nombre: string | undefined;
    let colegio_nivel: string | undefined;

    if (user.persona?.docente) {
      colegio_id = user.persona.docente.institucionId;
      institucion_id = user.persona.docente.institucionId;
      colegio_nombre = user.persona.docente.institucion?.nombre;
      colegio_nivel = user.persona.docente.institucion?.nivelEducativo;
    }

    let especialista_nivel: string | undefined;
    let especialista_modalidad: string | undefined;

    if (user.persona?.especialista && user.rol.codigo === 'jefe_area') {
      especialista_nivel = user.persona.especialista.nivelEducativo;
      especialista_modalidad = user.persona.especialista.modalidad ?? undefined;
    }

    const permissions = this.computeUserPermissions(user);

    return {
      sub: user.id,
      dni: user.persona.dni,
      role: user.rol.codigo as RoleCode,
      permissions,
      nombres: user.persona.nombres,
      apellidos: user.persona.apellidos,
      institucion_id,
      colegio_id,
      colegio_nombre,
      colegio_nivel,
      especialista_nivel,
      especialista_modalidad,
      firstLogin: user.isFirstLogin,
    };
  }

  /**
   * Calcula las capabilities efectivas del usuario:
   *   BASE_CAPABILITIES ∪ ROL_CAPABILITIES[rol]
   *   ∪ ESPECIALISTA_CARGO_CAPABILITIES[especialista.cargo] (si tiene)
   *   ∪ ∪ DOCENTE_CARGO_CAPABILITIES[cargo] por cada cargo activo
   *
   * Reemplaza la lectura directa de `rol_permisos` por el modelo
   * capability-based (Fase 1.6). El resultado es la UNION de las 3 fuentes.
   */
  private computeUserPermissions(user: AuthUserWithRelations): string[] {
    const rolCodigo = user.rol.codigo as RoleCode;

    const espCargo = (user.persona?.especialista?.cargo ?? null) as EspecialistaCargoEnum | null;

    const activeDocenteCargos: CargoNombre[] = (user.persona?.docente?.docenteCargos ?? [])
      .filter((dc) => dc.cargo?.nombre)
      .map((dc) => dc.cargo.nombre as CargoNombre);

    return computeEffectivePermissions(rolCodigo, espCargo, activeDocenteCargos);
  }
}
