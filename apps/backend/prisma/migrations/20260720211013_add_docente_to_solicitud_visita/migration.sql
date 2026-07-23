-- AlterTable
ALTER TABLE "solicitudes_visita" ADD COLUMN     "docente_id" UUID;

-- AddForeignKey
ALTER TABLE "solicitudes_visita" ADD CONSTRAINT "solicitudes_visita_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
