-- Sprint 3 - Trigger para inmutabilidad de cronograma.fecha/hora
-- Rechaza UPDATE directo sobre columnas criticas desde fuera de la funcion
-- sps_aplicar_reprogramacion. El service de NestJS llama a esta funcion
-- explicitamente, asi que el flujo legitimo sigue funcionando.

CREATE OR REPLACE FUNCTION sps_validar_update_cronograma()
RETURNS TRIGGER AS $$
BEGIN
    -- Permitir cambio de estado sin restricciones (cambio de PROGRAMADO, etc.)
    IF NEW.fecha_programada = OLD.fecha_programada
       AND NEW.hora_inicio = OLD.hora_inicio THEN
        RETURN NEW;
    END IF;

    -- Para cambios de fecha/hora, exigir que se haga via la funcion
    -- sps_aplicar_reprogramacion() que lleva control transaccional.
    IF current_setting('app.reprogramacion_apply', true) IS NULL
       OR current_setting('app.reprogramacion_apply', true) != 'true' THEN
        RAISE EXCEPTION 'UPDATE directo sobre fecha/hora no permitido. Use el endpoint POST /solicitudes-reprogramacion/:id/aprobar.'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_update_cronograma ON cronogramas;
CREATE TRIGGER trg_validar_update_cronograma
    BEFORE UPDATE ON cronogramas
    FOR EACH ROW
    EXECUTE FUNCTION sps_validar_update_cronograma();
