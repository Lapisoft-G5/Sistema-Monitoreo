-- AlterTable
ALTER TABLE "desempenos_plantilla" ALTER COLUMN "nombre" SET DATA TYPE TEXT;

-- RenameIndex
ALTER INDEX "uq_ficha_visita_plantilla" RENAME TO "fichas_monitoreo_cronograma_id_plantilla_id_key";
