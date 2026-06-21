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

// IDs resueltos en beforeAll a partir de los DNIs del seed. Asi el test
// sobrevive a `prisma migrate reset` (los UUIDs se regeneran cada vez).
let MONITOR_USER_ID = '';
let OTHER_USER_ID = '';
let DIRECTOR_IE_USER_ID = '';
let MONITOR_IE_ID = '';

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
  beforeAll(async () => {
    appPool = new Pool({ connectionString: APP_URL });
    adminPool = new Pool({ connectionString: ADMIN_URL });
    // Resolver IDs via DNI del seed (DNI = id estable, UUID se regenera).
    // MONITOR = Maria Elena (DNI 40000002) - jefe_gestion con Especialista (cargo Jefe de
    //          Gestion). El seed usa `monitores[0]` (primer Especialista por createdAt) y
    //          Maria Elena es la primera, asi que es la monitor de los 4 cronogramas seed.
    // OTHER = Ana Lucia (DNI 40000004) - especialista (cargo Especialista), pero los
    //          cronogramas del seed usan `monitores[1]` solo si la primera falla; Ana Lucia
    //          solo es monitor de los cronogramas que el usuario creo al probar. Para el
    //          test usamos Pedro Pablo (DNI 40000005) que NO es monitor de ninguno seed.
    const uMonitor = await adminPool.query(
      `SELECT u.id FROM usuarios u JOIN personas p ON p.id = u.persona_id
       WHERE p.dni = '40000002'`,
    );
    const uOther = await adminPool.query(
      `SELECT u.id FROM usuarios u JOIN personas p ON p.id = u.persona_id
       WHERE p.dni = '40000005'`,
    );
    const u3 = await adminPool.query(
      `SELECT u.id FROM usuarios u JOIN personas p ON p.id = u.persona_id
       WHERE p.dni = '40000006'`,
    );
    // MONITOR_IE_ID = institucion del primer cronograma sembrado.
    const ie = await adminPool.query(
      `SELECT institucion_id FROM cronogramas ORDER BY fecha_programada ASC LIMIT 1`,
    );
    MONITOR_USER_ID = uMonitor.rows[0].id;
    OTHER_USER_ID = uOther.rows[0].id;
    DIRECTOR_IE_USER_ID = u3.rows[0].id;
    MONITOR_IE_ID = ie.rows[0].institucion_id;
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
    // Conteos via admin (bypass RLS) para asserts relativas. La BD puede tener
    // mas cronogramas de los que el seed crea si el usuario ha estado probando.
    let totalCronogramas = 0;
    let cronogramasDeMonitor = 0;
    let cronogramasDeMonitorIe = 0;
    beforeAll(async () => {
      const all = await adminPool.query('SELECT count(*) FROM cronogramas');
      totalCronogramas = parseInt(all.rows[0].count);
      const mine = await adminPool.query(
        `SELECT count(*) FROM cronogramas c
         JOIN especialistas e ON c.monitor_id = e.id
         JOIN usuarios u ON u.persona_id = e.persona_id
         WHERE u.id = $1`,
        [MONITOR_USER_ID],
      );
      cronogramasDeMonitor = parseInt(mine.rows[0].count);
      const mineIe = await adminPool.query(
        `SELECT count(*) FROM cronogramas WHERE institucion_id = $1`,
        [MONITOR_IE_ID],
      );
      cronogramasDeMonitorIe = parseInt(mineIe.rows[0].count);
    });

    it('especialista monitor: ve solo SUS cronogramas', async () => {
      await asRole(MONITOR_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(cronogramasDeMonitor);
      });
    });

    it('especialista NO monitor: NO ve cronogramas de otros (0 filas)', async () => {
      await asRole(OTHER_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(0);
      });
    });

    it('jefe_gestion: ve TODO', async () => {
      await asRole(MONITOR_USER_ID, 'jefe_gestion', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(totalCronogramas);
      });
    });

    it('director_institucion: ve solo cronogramas de su IE', async () => {
      await asRole(DIRECTOR_IE_USER_ID, 'director_institucion', MONITOR_IE_ID, async (client) => {
        const result = await client.query('SELECT count(*) FROM cronogramas');
        expect(parseInt(result.rows[0].count)).toBe(cronogramasDeMonitorIe);
      });
    });

    it('director_institucion de OTRA IE: NO ve cronogramas (0 filas)', async () => {
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
    // Conteos via admin para asserts relativas (el seed puede crear 0+ fichas).
    let totalFichas = 0;
    let fichasDeMonitor = 0;
    beforeAll(async () => {
      const all = await adminPool.query('SELECT count(*) FROM fichas_monitoreo');
      totalFichas = parseInt(all.rows[0].count);
      const mine = await adminPool.query(
        `SELECT count(*) FROM fichas_monitoreo f
         JOIN cronogramas c ON c.id = f.cronograma_id
         JOIN especialistas e ON c.monitor_id = e.id
         JOIN usuarios u ON u.persona_id = e.persona_id
         WHERE u.id = $1`,
        [MONITOR_USER_ID],
      );
      fichasDeMonitor = parseInt(mine.rows[0].count);
    });

    it('especialista monitor: ve solo SUS fichas', async () => {
      await asRole(MONITOR_USER_ID, 'especialista', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM fichas_monitoreo');
        expect(parseInt(result.rows[0].count)).toBe(fichasDeMonitor);
      });
    });

    it('jefe_gestion: ve todas las fichas', async () => {
      await asRole(MONITOR_USER_ID, 'jefe_gestion', null, async (client) => {
        const result = await client.query('SELECT count(*) FROM fichas_monitoreo');
        expect(parseInt(result.rows[0].count)).toBe(totalFichas);
      });
    });
  });
});
