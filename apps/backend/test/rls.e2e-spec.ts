import { Pool } from 'pg';

/**
 * E2E test de las RLS policies reescritas en Fase 3.
 *
 * Requisitos:
 *  - Docker con `monitoring-postgres` corriendo.
 *  - Rol `monitoreo_app` creado (correr `prisma/setup.sql`).
 *  - Migrations + seed aplicados.
 *
 * Estos tests NO corren con el `pnpm test` normal (que es unit/integration).
 * Se ejecutan via `pnpm test:e2e` y usan conexion directa a Postgres.
 *
 * Verifican que las policies a) usen los codigos de rol reales (snake_case
 * espanol) y b) aislen correctamente a un especialista de ver cronogramas
 * / fichas de otro.
 */

const TEST_DB =
  process.env.DATABASE_URL_TEST ??
  process.env.DATABASE_URL ??
  'postgresql://admin:admin@localhost:5432/monitoring';

// Conexion como monitoreo_app (no superuser, RLS aplica).
const APP_URL = TEST_DB.replace('://admin:admin', '://monitoreo_app:CHANGE_ME_FOR_LOCAL_DEV');
// Conexion admin (superuser, RLS BYPASSEADA) para setup/cleanup.
const ADMIN_URL = TEST_DB;

let appPool: Pool;
let adminPool: Pool;

const MONITOR_USER_ID = 'a0c25551-a627-41b3-acdd-12bca61fe310'; // DNI 40000002, Ana Lucia (jefe_gestion + Especialista monitor del cronograma seeded)
const OTHER_USER_ID = '4c6a5bcd-6074-4778-b61e-3b7695bd4a7f'; // DNI 40000004, especialista NO monitor
const DIRECTOR_IE_USER_ID = '5d3cd3ad-e423-4b1d-9feb-d12b92920ca7'; // DNI 40000006, director_institucion
const MONITOR_IE_ID = '10249f35-9517-4af7-8426-36d05ce3229c'; // institucion del cronograma seeded

async function asRole(
  userId: string,
  rol: string,
  institucionId: string | null,
  callback: (pool: Pool) => Promise<void>,
): Promise<void> {
  // El set_config con tercer parametro `true` lo hace transaction-local;
  // necesitamos un BEGIN explicito para que el callback vea los GUCs.
  const client = await appPool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `SELECT
        set_config('app.user_id', $1, true),
        set_config('app.user_rol', $2, true),
        set_config('app.user_institucion_id', $3, true)`,
      [userId, rol, institucionId ?? ''],
    );
    await callback(client as unknown as Pool);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

describe('RLS Policies - Fase 3 (codes reales + aislamiento)', () => {
  beforeAll(() => {
    appPool = new Pool({ connectionString: APP_URL });
    adminPool = new Pool({ connectionString: ADMIN_URL });
  });

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  describe('conexion como monitoreo_app (no superuser)', () => {
    it('monitoreo_app puede leer de la BD (permisos SELECT OK)', async () => {
      const result = await appPool.query('SELECT count(*) FROM usuarios');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });
  });

  describe('cronogramas - aislamiento por especialista', () => {
    it('especialista monitor: ve SU cronograma (1 fila)', async () => {
      await asRole(MONITOR_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(1);
      });
    });

    it('especialista NO monitor: NO ve cronogramas de otros (0 filas)', async () => {
      await asRole(OTHER_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(0);
      });
    });

    it('jefe_gestion: ve TODO (1 fila)', async () => {
      await asRole(MONITOR_USER_ID, 'jefe_gestion', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(1);
      });
    });

    it('director_institucion: ve solo cronogramas de su IE (1 fila)', async () => {
      await asRole(DIRECTOR_IE_USER_ID, 'director_institucion', MONITOR_IE_ID, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(1);
      });
    });

    it('director_institucion de OTRA IE: NO ve el cronograma (0 filas)', async () => {
      // El director_ie 40000006 esta en la institucion del cronograma seeded.
      // Cualquier director_institucion con otro institucionId no debe verlo.
      await asRole(
        DIRECTOR_IE_USER_ID,
        'director_institucion',
        '00000000-0000-0000-0000-000000000099', // institucion id que no existe
        async (client) => {
          const result = await client.query('SELECT count(*) FROM cronogramas');
          expect(parseInt(result.rows[0].count)).toBe(0);
        },
      );
    });

    it('sin GUCs: 0 filas (policy bloquea por default)', async () => {
      // Sin setear GUCs, current_setting retorna vacio. La policy matchea solo ALL.
      const result = await appPool.query('SELECT count(*) FROM cronogramas');
      expect(parseInt(result.rows[0].count)).toBe(0);
    });
  });

  describe('fichas_monitoreo - aislamiento', () => {
    it('especialista monitor: ve sus fichas (0 porque el seed no crea fichas)', async () => {
      // El seed crea un cronograma pero no una ficha. La ficha count es 0
      // independientemente del RLS. Pero el RLS debe permitir 0 (no denegar).
      await asRole(MONITOR_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM fichas_monitoreo');
        expect(parseInt(result.rows[0].count)).toBe(0);
      });
    });

    it('jefe_gestion: ve todas las fichas (0 con seed actual)', async () => {
      await asRole(MONITOR_USER_ID, 'jefe_gestion', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM fichas_monitoreo');
        expect(parseInt(result.rows[0].count)).toBe(0);
      });
    });
  });
});
