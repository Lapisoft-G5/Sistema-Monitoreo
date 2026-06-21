-- ============================================================================
-- Re-aplicar policies RLS con JOIN corregido.
-- ============================================================================
-- La migracion `20260621200000_fase3_rls_fix_roles` se aplico antes del JOIN
-- fix. Este script la re-aplica (los DROP POLICY IF EXISTS son idempotentes).

DROP POLICY IF EXISTS fichas_role_isolation ON fichas_monitoreo;
DROP POLICY IF EXISTS cronogramas_role_isolation ON cronogramas;

CREATE POLICY fichas_role_isolation ON fichas_monitoreo
    FOR ALL
    USING (
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel')
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
        OR (
            current_setting('app.user_rol', true) = 'docente'
            AND estado = 'FINALIZADO'
        )
    )
    WITH CHECK (
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'especialista'
        )
    );

CREATE POLICY cronogramas_role_isolation ON cronogramas
    FOR ALL
    USING (
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel')
        OR (
            current_setting('app.user_rol', true) IN (
                'director_institucion', 'coordinador_pedagogico', 'jefe_taller'
            )
            AND institucion_id::text = current_setting('app.user_institucion_id', true)
        )
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
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'especialista'
        )
    );
