-- DropForeignKey
ALTER TABLE "docentes" DROP CONSTRAINT "docentes_institucion_id_fkey";

-- AlterTable
ALTER TABLE "docentes" ALTER COLUMN "institucion_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
