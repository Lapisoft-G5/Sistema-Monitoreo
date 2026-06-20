-- Sprint 3 - Add nivel_educativo_id to docentes (completando normalizacion)
ALTER TABLE "docentes" ADD COLUMN IF NOT EXISTS "nivel_educativo_id" UUID;
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_nivel_educativo_id_fkey"
    FOREIGN KEY ("nivel_educativo_id") REFERENCES "niveles_educativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
