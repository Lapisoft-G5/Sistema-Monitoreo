-- Regla de negocio: maximo 3 visitas pendientes por especialista (EDU-0011 / EDU-0015).
-- Documentado en PROJECT_DOCUMENTATION.md seccion 5.8 y docs/api/sprint3.md.
--
-- Un especialista no puede tener mas de 3 cronogramas en estado activo
-- (PROGRAMADO, EN_PROCESO, REPROGRAMADO) al mismo tiempo. La validacion
-- principal la hace SchedulingService.crearVisita (mensaje claro al usuario);
-- este check trigger es la red de seguridad en la BD.

CREATE OR REPLACE FUNCTION fn_validar_max_tres_pendientes() RETURNS TRIGGER AS $$
DECLARE
  pendientes INT;
BEGIN
  IF NEW.estado NOT IN ('PROGRAMADO', 'EN_PROCESO', 'REPROGRAMADO') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO pendientes
  FROM cronogramas
  WHERE monitor_id = NEW.monitor_id
    AND estado IN ('PROGRAMADO', 'EN_PROCESO', 'REPROGRAMADO')
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF pendientes >= 3 THEN
    RAISE EXCEPTION
      'El especialista ya tiene 3 visitas pendientes. Completa o cancela una antes de programar otra.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_max_tres_pendientes ON cronogramas;

CREATE TRIGGER trg_validar_max_tres_pendientes
  BEFORE INSERT OR UPDATE OF estado, monitor_id ON cronogramas
  FOR EACH ROW
  EXECUTE FUNCTION fn_validar_max_tres_pendientes();
