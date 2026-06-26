-- Re-apply RLS policies including docente role for own evaluations

DROP POLICY IF EXISTS fichas_role_isolation ON fichas_monitoreo;
CREATE POLICY fichas_role_isolation ON fichas_monitoreo
    FOR ALL
    USING (
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel', 'jefe_area')
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
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN docentes d ON d.persona_id = u.persona_id
                JOIN cronogramas c ON c.id = fichas_monitoreo.cronograma_id
                WHERE u.id::text = current_setting('app.user_id', true)
                  AND c.evaluado_id = d.id
            )
        )
    )
    WITH CHECK (
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'jefe_area', 'especialista'
        )
    );

DROP POLICY IF EXISTS cronogramas_role_isolation ON cronogramas;
CREATE POLICY cronogramas_role_isolation ON cronogramas
    FOR ALL
    USING (
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel', 'jefe_area')
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
        OR (
            current_setting('app.user_rol', true) = 'docente'
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN docentes d ON d.persona_id = u.persona_id
                WHERE u.id::text = current_setting('app.user_id', true)
                  AND cronogramas.evaluado_id = d.id
            )
        )
    );
