-- Drop trigger and function for max 3 pending visits per specialist
DROP TRIGGER IF EXISTS trg_validar_max_tres_pendientes ON cronogramas;
DROP FUNCTION IF EXISTS fn_validar_max_tres_pendientes();