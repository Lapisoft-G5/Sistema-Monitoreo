import { RoleCode } from '../../common/enums/role.enum.js';
import { config } from 'dotenv';
import { jest } from '@jest/globals';
config({ path: '.env' });
config({ path: '../../../../.env' });

import { PrismaService } from './prisma.service.js';
import { RlsMiddleware } from './rls.middleware.js';
import { Pool } from 'pg';
import type { Request, Response, NextFunction } from 'express';

describe('RlsMiddleware (integration)', () => {
  let prisma: PrismaService;
  let middleware: RlsMiddleware;
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    prisma = {
      $executeRawUnsafe: async (sql: string, ...params: unknown[]) => {
        return pool.query(sql, params);
      },
    } as unknown as PrismaService;
    middleware = new RlsMiddleware(prisma);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('setea app.user_id y app.user_rol al hacer next() con usuario', async () => {
    const req = {
      user: { sub: 'test-user-id', role: RoleCode.ESPECIALISTA, dni: '40000004' },
    } as unknown as Request;
    const next = jest.fn<any>() as unknown as NextFunction;

    await middleware.use(req, {} as Response, next);

    expect(next).toHaveBeenCalled();

    const result = await pool.query(
      `SELECT current_setting('app.user_id', true) AS uid, current_setting('app.user_rol', true) AS urole`,
    );
    expect(result.rows[0].uid).toBe('test-user-id');
    // Fase 1.7: el rol ahora se serializa con el codigo real (lowercase snake_case)
    // de RoleCode, no la constante en mayusculas que las policies RLS de la
    // migracion esperan (mismatch conocido, se corrige en Fase 3).
    expect(result.rows[0].urole).toBe(RoleCode.ESPECIALISTA);
  });

  it('no hace nada si no hay user en la request', async () => {
    const req = {} as Request;
    const next = jest.fn<any>() as unknown as NextFunction;

    await middleware.use(req, {} as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
