-- Re-apply RLS policies including jefe_area role

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
    )
    WITH CHECK (
        current_setting('app.user_rol', true) IN (
            'jefe_gestion', 'director_ugel', 'jefe_area', 'especialista'
        )
    );

DROP POLICY IF EXISTS reprogramaciones_role_isolation ON solicitudes_reprogramacion;
CREATE POLICY reprogramaciones_role_isolation ON solicitudes_reprogramacion
    FOR ALL
    USING (
        current_setting('app.user_rol', true) IN ('jefe_gestion', 'director_ugel', 'jefe_area')
        OR solicitante_id::text = current_setting('app.user_id', true)
        OR resuelto_por_id::text = current_setting('app.user_id', true)
    )
    WITH CHECK (
        current_setting('app.user_id', true) IS NOT NULL
        AND current_setting('app.user_rol', true) IS NOT NULL
    );