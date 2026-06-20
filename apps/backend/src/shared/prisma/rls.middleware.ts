import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service.js';

interface AuthenticatedRequest extends Request {
  user?: { sub: string; role: string; dni: string };
}

/**
 * Middleware RLS: setea los GUCs `app.user_id` y `app.user_rol` al inicio
 * de cada request autenticada, para que las policies de Row Level Security
 * de Postgres filtren automaticamente las filas que el usuario puede ver.
 *
 * Patron identico al de `app.reprogramacion_apply` usado en el trigger
 * de inmutabilidad de cronogramas.
 *
 * NOTA: usa `set_config(name, value, false)` en lugar de `SET LOCAL`
 * porque Prisma no envuelve cada request en una transaccion. El parametro
 * `false` significa que el setting dura lo que resta de la sesion de la
 * conexion del pool, no solo de la transaccion. Esto es un trade-off
 * conocido: en deployment con connection pooler (PgBouncer) puede haber
 * leakage entre requests. Para corregirlo completamente, usar
 * `pool.connect()` por request (ver TODO en sprint5).
 */
@Injectable()
export class RlsMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    const user = req.user;
    if (user?.sub && user?.role) {
      try {
        await this.prisma.$executeRawUnsafe(
          `SELECT set_config('app.user_id', $1, false), set_config('app.user_rol', $2, false)`,
          user.sub,
          user.role,
        );
      } catch (err) {
        console.warn('[rls] No se pudieron setear GUCs:', (err as Error).message);
      }
    }
    next();
  }
}
