-- ============================================================================
-- Sprint 3: RLS policies + vista materializada (sin particionamiento)
-- ============================================================================
-- NOTA: el particionamiento de `fichas_monitoreo` se omite en este sprint
-- porque el volumen actual no lo justifica y agrega complejidad operacional
-- (PG no soporta FKs a tablas particionadas sin columna de particion compuesta,
-- lo que rompe el modelo de Prisma). Se replantea en sprint 4 si el volumen
-- crece. Por ahora, el RLS y la vista materializada son los Quick Wins.

-- ============================================================================
-- 1. ROW LEVEL SECURITY (RLS) - Aislamiento por rol
-- ============================================================================
-- Decisión: el sistema tiene roles (ADMIN, ESPECIALISTA, DIRECTOR_IE).
-- RLS garantiza que un especialista solo ve SUS propias fichas/cronogramas.
-- El backend setea los GUCs `app.user_id` y `app.user_rol` en cada request
-- (mismo patron que `app.reprogramacion_apply` del trigger).
--
-- IMPORTANTE: RLS se aplica SOLO a roles no-admin. El backend usa superuser
-- de Postgres que BYPASSA RLS, pero el codigo de aplicación setea los GUCs
-- explicitamente para cada query.

-- Habilitar RLS
ALTER TABLE fichas_monitoreo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_reprogramacion ENABLE ROW LEVEL SECURITY;

-- Policies para `fichas_monitoreo`
-- NOTA: el campo `creado_por_id` es la persona (usuario) que creo la ficha,
-- que para fichas de monitoreo es el especialista que realizo la visita.
DROP POLICY IF EXISTS fichas_especialista_isolation ON fichas_monitoreo;
CREATE POLICY fichas_especialista_isolation ON fichas_monitoreo
    FOR ALL
    USING (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR (
            current_setting('app.user_rol', true) = 'ESPECIALISTA'
            AND creado_por_id::text = current_setting('app.user_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR (
            current_setting('app.user_rol', true) = 'ESPECIALISTA'
            AND creado_por_id::text = current_setting('app.user_id', true)
        )
    );

-- Policies para `cronogramas`
DROP POLICY IF EXISTS cronogramas_especialista_isolation ON cronogramas;
CREATE POLICY cronogramas_especialista_isolation ON cronogramas
    FOR ALL
    USING (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR (
            current_setting('app.user_rol', true) = 'ESPECIALISTA'
            AND monitor_id::text = current_setting('app.user_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR (
            current_setting('app.user_rol', true) = 'ESPECIALISTA'
            AND monitor_id::text = current_setting('app.user_id', true)
        )
    );

-- Policies para `solicitudes_reprogramacion` (solicitante + decisor ven)
DROP POLICY IF EXISTS reprogramaciones_isolation ON solicitudes_reprogramacion;
CREATE POLICY reprogramaciones_isolation ON solicitudes_reprogramacion
    FOR ALL
    USING (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR solicitante_id::text = current_setting('app.user_id', true)
        OR resuelto_por_id::text = current_setting('app.user_id', true)
    )
    WITH CHECK (
        current_setting('app.user_rol', true) = 'ADMIN'
        OR solicitante_id::text = current_setting('app.user_id', true)
    );

-- ============================================================================
-- 2. VISTA MATERIALIZADA: consolidado mensual por especialista
-- ============================================================================
-- Decisión: el reporte /reportes/consolidado es lento porque agrega
-- todas las fichas. Vista materializada refrescable diariamente.
-- Refresco automatico via endpoint POST /reportes/refresh-consolidado
-- (ejecuta REFRESH MATERIALIZED VIEW CONCURRENTLY).

DROP MATERIALIZED VIEW IF EXISTS mv_consolidado_mensual;

CREATE MATERIALIZED VIEW mv_consolidado_mensual AS
SELECT
    date_trunc('month', f.created_at) AS mes,
    f.creado_por_id,
    p.nombres || ' ' || p.apellidos AS especialista_nombre,
    COUNT(f.id) AS total_fichas,
    COUNT(*) FILTER (WHERE f.estado = 'FINALIZADA') AS fichas_finalizadas,
    AVG(f.promedio) AS promedio_puntaje,
    MIN(f.promedio) AS min_puntaje,
    MAX(f.promedio) AS max_puntaje
FROM fichas_monitoreo f
JOIN personas p ON p.id = f.creado_por_id
WHERE f.estado = 'FINALIZADA'
GROUP BY date_trunc('month', f.created_at), f.creado_por_id, p.nombres, p.apellidos;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_consolidado_pk
    ON mv_consolidado_mensual (mes, creado_por_id);

-- ============================================================================
-- 3. REVOKE UPDATE/DELETE en catalogos (solo lectura para app users)
-- ============================================================================
-- Los catalogos (niveles_educativos, areas_curriculares, etc.) solo los
-- modifica el seed inicial. Los usuarios de la app solo consultan.
-- NOTA: si el rol `monitoreo_app` no existe, este REVOKE falla silenciosamente
-- (IF EXISTS). Se crea en una migracion previa o en setup.sql.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monitoreo_app') THEN
        REVOKE UPDATE, DELETE ON niveles_educativos FROM monitoreo_app;
        REVOKE UPDATE, DELETE ON areas_curriculares FROM monitoreo_app;
        REVOKE UPDATE, DELETE ON especialidades FROM monitoreo_app;
        REVOKE UPDATE, DELETE ON turnos FROM monitoreo_app;
        REVOKE UPDATE, DELETE ON cursos FROM monitoreo_app;
        REVOKE UPDATE, DELETE ON niveles_calificacion FROM monitoreo_app;
    END IF;
END $$;

-- ============================================================================
-- FIN Sprint 3 RLS + Materialized View
-- ============================================================================
