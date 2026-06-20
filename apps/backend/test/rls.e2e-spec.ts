import { Pool } from 'pg';

const TEST_DB =
  process.env.DATABASE_URL_TEST ??
  process.env.DATABASE_URL ??
  'postgresql://admin:admin@localhost:5432/monitoring';

describe('RLS Policies - Sprint 3', () => {
  let pool: Pool;
  let adminPool: Pool;

  beforeAll(async () => {
    adminPool = new Pool({ connectionString: TEST_DB });
    pool = new Pool({ connectionString: TEST_DB });
  });

  afterAll(async () => {
    await pool.end();
    await adminPool.end();
  });

  afterEach(async () => {
    // Reset GUCs despues de cada test para no contaminar
    await pool.query(`SELECT set_config('app.user_id', '', false)`);
    await pool.query(`SELECT set_config('app.user_rol', '', false)`);
  });

  describe('fichas_monitoreo', () => {
    it('debe permitir SELECT a admin (bypassa RLS)', async () => {
      await pool.query(`SELECT set_config('app.user_rol', 'ADMIN', false)`);
      const result = await pool.query(`SELECT count(*) FROM fichas_monitoreo`);
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
    });

    it('debe aislar fichas: especialista solo ve las suyas', async () => {
      // Setear como especialista X (con SET ROLE para que RLS aplique)
      const especialistaXId = '00000000-0000-0000-0000-000000000001';
      await pool.query(`SET ROLE test_user`);
      await pool.query(`SELECT set_config('app.user_rol', 'ESPECIALISTA', false)`);
      await pool.query(`SELECT set_config('app.user_id', $1, false)`, [especialistaXId]);

      const result = await pool.query(
        `SELECT count(*) FROM fichas_monitoreo WHERE creado_por_id != $1::uuid`,
        [especialistaXId]
      );

      await pool.query(`RESET ROLE`);

      // RLS debe impedir ver fichas de otros especialistas
      expect(parseInt(result.rows[0].count)).toBe(0);
    });

    it('debe retornar 0 filas si el GUC app.user_rol no esta seteado', async () => {
      // Sin setear GUCs, RLS bloquea todo
      await pool.query(`SET ROLE test_user`);
      const result = await pool.query(`SELECT count(*) FROM fichas_monitoreo`);
      await pool.query(`RESET ROLE`);
      // RLS filtra todas las filas porque current_setting retorna ''
      expect(parseInt(result.rows[0].count)).toBe(0);
    });
  });

  describe('cronogramas', () => {
    it('debe aislar cronogramas por monitor_id', async () => {
      const monitorId = '00000000-0000-0000-0000-000000000002';
      // SET ROLE a un usuario no-superuser para que RLS aplique
      await pool.query(`SET ROLE test_user`);
      await pool.query(`SELECT set_config('app.user_rol', 'ESPECIALISTA', false)`);
      await pool.query(`SELECT set_config('app.user_id', $1, false)`, [monitorId]);

      const result = await pool.query(
        `SELECT count(*) FROM cronogramas WHERE monitor_id != $1::uuid AND monitor_id IS NOT NULL`,
        [monitorId]
      );

      await pool.query(`RESET ROLE`);

      // RLS debe filtrar: 0 cronogramas visibles con monitor_id distinto al nuestro.
      // (Los cronogramas con monitor_id NULL no se cuentan en esta query.)
      expect(parseInt(result.rows[0].count)).toBe(0);
    });
  });

  describe('solicitudes_reprogramacion', () => {
    it('debe permitir ver solicitudes donde soy solicitante o decisor', async () => {
      const solicitanteId = '00000000-0000-0000-0000-000000000003';
      await pool.query(`SET ROLE test_user`);
      await pool.query(`SELECT set_config('app.user_rol', 'ESPECIALISTA', false)`);
      await pool.query(`SELECT set_config('app.user_id', $1, false)`, [solicitanteId]);

      const result = await pool.query(
        `SELECT count(*) FROM solicitudes_reprogramacion
         WHERE solicitante_id != $1::uuid AND (resuelto_por_id IS NULL OR resuelto_por_id != $1::uuid)`,
        [solicitanteId]
      );

      await pool.query(`RESET ROLE`);

      // RLS debe impedir ver solicitudes de terceros
      expect(parseInt(result.rows[0].count)).toBe(0);
    });
  });
});
