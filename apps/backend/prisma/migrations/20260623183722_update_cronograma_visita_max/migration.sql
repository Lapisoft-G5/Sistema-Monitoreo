-- Incrementa el máximo de visitas por docente de 4 a 5.
-- Esto alinea el CHECK constraint con la validación @Max(5) en CreateVisitaDto
-- y con el UI (que muestra botones 1-5).
ALTER TABLE "cronogramas" DROP CONSTRAINT IF EXISTS "cronogramas_numero_visita_check";
ALTER TABLE "cronogramas" ADD CONSTRAINT "cronogramas_numero_visita_check"
  CHECK ("numero_visita" BETWEEN 1 AND 5);
