/*
  Warnings:

  - You are about to drop the `jefes_area` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "jefes_area" DROP CONSTRAINT "jefes_area_persona_id_fkey";

-- AlterTable
ALTER TABLE "cursos" ADD COLUMN     "modalidad" VARCHAR(50);

-- AlterTable
ALTER TABLE "docentes" ADD COLUMN     "modalidad" VARCHAR(50);

-- AlterTable
ALTER TABLE "especialistas" ADD COLUMN     "modalidad" VARCHAR(50);

-- DropTable
DROP TABLE "jefes_area";
