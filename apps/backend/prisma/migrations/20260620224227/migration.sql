/*
  Warnings:

  - A unique constraint covering the columns `[nombre,nivel_educativo_id]` on the table `cursos` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nivel_educativo_id` on table `cursos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modalidad` on table `instituciones_educativas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "instituciones_educativas" DROP CONSTRAINT "instituciones_educativas_nivel_educativo_id_fkey";

-- AlterTable
ALTER TABLE "cursos" ALTER COLUMN "nivel_educativo_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "instituciones_educativas" ALTER COLUMN "modalidad" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cursos_nombre_nivel_educativo_id_key" ON "cursos"("nombre", "nivel_educativo_id");

-- AddForeignKey
ALTER TABLE "instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_nivel_educativo_id_fkey" FOREIGN KEY ("nivel_educativo_id") REFERENCES "niveles_educativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
