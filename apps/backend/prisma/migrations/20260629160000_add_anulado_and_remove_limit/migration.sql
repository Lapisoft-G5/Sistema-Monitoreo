-- Añadir ANULADO al check constraint de estado cronogramas
-- y eliminar el límite superior de numero_visita (antes BETWEEN 1 AND 5)

ALTER TABLE "cronogramas" DROP CONSTRAINT IF EXISTS "cronogramas_estado_check";
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_estado_check"
  CHECK ("estado" IN ('PROGRAMADO', 'EN_PROCESO', 'COMPLETADO', 'REPROGRAMADO', 'CANCELADO', 'ANULADO'));

ALTER TABLE "cronogramas" DROP CONSTRAINT IF EXISTS "cronogramas_numero_visita_check";
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_numero_visita_check"
  CHECK ("numero_visita" >= 1);
