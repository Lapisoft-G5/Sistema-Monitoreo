-- Fase 2 (continuación) — backfill + partial unique indexes
-- Aplica sobre la migración `20260621193422_fase2_especialista_cargos_and_principal`
-- que ya creó la tabla `especialista_cargos` y la columna `docente_cargos.es_principal`.
--
-- Backfill:
--   1. especialista_cargos: un registro activo por Especialista, espejando
--      `especialistas.cargo`, con es_principal = true y fecha_inicio = created_at.
--   2. docente_cargos.es_principal: el cargo activo de mayor prioridad por
--      docente (Director > Subdirector > Coord. Ped. > Jefe de Taller > PIP > Docente).
--
-- Constraints nuevos:
--   - uq_especialista_cargo_activo: max 1 cargo activo (fecha_fin IS NULL) por Especialista.
--   - uq_docente_cargo_principal_activo: max 1 cargo principal activo
--     (es_principal = true AND fecha_fin IS NULL) por Docente.

-- ==========================================
-- 1. Backfill: especialista_cargos
-- ==========================================
INSERT INTO "especialista_cargos" ("id", "especialista_id", "cargo", "fecha_inicio", "fecha_fin", "es_principal")
SELECT
  gen_random_uuid(),
  "id",
  "cargo",
  "created_at",
  NULL,
  true
FROM "especialistas";

-- ==========================================
-- 2. Backfill: docente_cargos.es_principal
--    Elegimos el cargo activo de mayor prioridad por docente. Si hay varios
--    activos (no debería pasar por las reglas de coexistencia), gana el más
--    reciente. El partial unique index abajo impide futuros duplicados.
-- ==========================================
UPDATE "docente_cargos" dc
SET "es_principal" = true
FROM "cargos" c
WHERE dc."cargo_id" = c."id"
  AND dc."fecha_fin" IS NULL
  AND dc."id" = (
    SELECT dc2."id"
    FROM "docente_cargos" dc2
    JOIN "cargos" c2 ON dc2."cargo_id" = c2."id"
    WHERE dc2."docente_id" = dc."docente_id"
      AND dc2."fecha_fin" IS NULL
    ORDER BY
      CASE c2."nombre"
        WHEN 'Director' THEN 1
        WHEN 'Subdirector' THEN 2
        WHEN 'Coordinador Pedagógico' THEN 3
        WHEN 'Jefe de Taller' THEN 4
        WHEN 'PIP' THEN 5
        WHEN 'Docente de Aula' THEN 6
      END ASC,
      dc2."fecha_inicio" DESC
    LIMIT 1
  );

-- ==========================================
-- 3. Partial unique indexes (constraints)
-- ==========================================

-- Especialista: max 1 cargo activo por Especialista.
CREATE UNIQUE INDEX "uq_especialista_cargo_activo"
  ON "especialista_cargos" ("especialista_id")
  WHERE "fecha_fin" IS NULL;

-- Docente: max 1 cargo principal activo por Docente.
CREATE UNIQUE INDEX "uq_docente_cargo_principal_activo"
  ON "docente_cargos" ("docente_id")
  WHERE "es_principal" = true AND "fecha_fin" IS NULL;
