-- ============================================================================
-- Sprint 3 fix: RLS policies con codigos de rol reales
-- ============================================================================
-- La migracion `sprint3_rls_partitioning` (20260620210000) creo policies que
-- comparan `current_setting('app.user_rol')` contra `'ADMIN'` y `'ESPECIALISTA'`
-- (en mayusculas, en ingles). Los roles reales del sistema (segun
-- `database/seeders/auth.js`) son snake_case en espanol:
--   director_ugel, jefe_area, jefe_gestion, especialista, director_institucion,
--   coordinador_pedagogico, jefe_taller, docente, invitado.
--
-- Esto hacia que la policy NUNCA matcheara (excepto en un admin con rol
-- 'ADMIN' que no existe) y, sumado a que la conexion del backend es superuser
-- (BYPASSRLS = true), el RLS estaba totalmente inerte.
--
-- Ademas se agrega un nuevo GUC `app.user_institucion_id` para que las
-- policies de INSTITUCION scope puedan comparar el institucion_id del usuario
-- contra el institucion_id del registro via JOIN con `cronogramas`.
--
-- Decisiones de scope por rol:
--   - ALL (director_ugel, jefe_gestion): ven todo.
--   - INSTITUCION (director_institucion, coordinador_pedagogico, jefe_taller):
--     ven donde cronograma.institucion_id == user.institucion_id.
--   - MONITOR (especialista): ve donde cronograma.monitor_id == user.id (o
--     ficha.creado_por_id == user.id para fichas).
--   - DOCENTE: ve solo donde la ficha esta FINALIZADA.
--   - Resto: sin acceso (la policy devuelve false).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Habilitar RLS (ya estaba habilitado, pero aseguramos).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE fichas_monitoreo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_reprogramacion ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. fichas_monitoreo
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS fichas_especialista_isolation ON fichas_monitoreo;
DROP POLICY IF EXISTS fichas_role_isolation ON fichas_monitoreo;
CREATE POLICY fichas_role_isolation ON fichas_monitoreo
    FOR ALL
    USING (
        -- ALL: jefe_gestion, director_ugel
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel')
        -- INSTITUCION: director_institucion, coord_pedagogico, jefe_taller
        OR (
            current_setting('app.user_rol', true) IN (
                'director_institucion', 'coordinador_pedagogico', 'jefe_taller'
            )
            AND EXISTS (
                SELECT 1 FROM cronogramas c
                WHERE c.id = fichas_monitoreo.cronograma_id
                  AND c.institucion_id::text = current_setting('app.user_institucion_id', true)
            )
        )
        -- MONITOR: especialista (ve solo sus propias fichas, via JOIN con personas)
        OR (
            current_setting('app.user_rol', true) = 'especialista'
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN especialistas e ON e.persona_id = u.persona_id
                JOIN cronogramas c ON c.id = fichas_monitoreo.cronograma_id
                WHERE u.id::text = current_setting('app.user_id', true)
                  AND c.monitor_id = e.id
            )
        )
        -- DOCENTE: solo las fichas FINALIZADAS (no podemos filtrar por docente
        -- sin JOIN adicional; limitamos a finalizadas para no exponer BORRADOR)
        OR (
            current_setting('app.user_rol', true) = 'docente'
            AND estado = 'FINALIZADO'
        )
    )
    WITH CHECK (
        -- Solo MONITOR y ADMIN (jefe_gestion/director_ugel) pueden INSERT.
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'especialista'
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. cronogramas
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS cronogramas_especialista_isolation ON cronogramas;
DROP POLICY IF EXISTS cronogramas_role_isolation ON cronogramas;
CREATE POLICY cronogramas_role_isolation ON cronogramas
    FOR ALL
    USING (
        -- ALL
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel')
        -- INSTITUCION
        OR (
            current_setting('app.user_rol', true) IN (
                'director_institucion', 'coordinador_pedagogico', 'jefe_taller'
            )
            AND institucion_id::text = current_setting('app.user_institucion_id', true)
        )
        -- MONITOR (via JOIN con personas: cronograma.monitor_id = especialista.id,
        -- especialista.persona_id = usuario.persona_id)
        OR (
            current_setting('app.user_rol', true) = 'especialista'
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN especialistas e ON e.persona_id = u.persona_id
                WHERE u.id::text = current_setting('app.user_id', true)
                  AND cronogramas.monitor_id = e.id
            )
        )
    )
    WITH CHECK (
        -- Solo MONITOR y ADMIN pueden crear/editar cronogramas
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'especialista'
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. solicitudes_reprogramacion
--    (solicitante + decisor + ALL ven)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS reprogramaciones_isolation ON solicitudes_reprogramacion;
DROP POLICY IF EXISTS reprogramaciones_role_isolation ON solicitudes_reprogramacion;
CREATE POLICY reprogramaciones_role_isolation ON solicitudes_reprogramacion
    FOR ALL
    USING (
        -- ALL
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel')
        -- Solicitante ve sus propias solicitudes
        OR solicitante_id::text = current_setting('app.user_id', true)
        -- Decisor ve las que resolvio
        OR resuelto_por_id::text = current_setting('app.user_id', true)
    )
    WITH CHECK (
        -- Cualquiera puede crear; el trigger valida el workflow de aprobacion
        current_setting('app.user_id', true) IS NOT NULL
        AND current_setting('app.user_rol', true) IS NOT NULL
    );
