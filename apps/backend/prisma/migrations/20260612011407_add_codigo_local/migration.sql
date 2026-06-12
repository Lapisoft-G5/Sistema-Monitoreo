/*
  Warnings:

  - Added the required column `codigo_local` to the `instituciones_educativas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "instituciones_educativas" ADD COLUMN     "codigo_local" VARCHAR(8) NOT NULL,
ADD COLUMN     "modalidad" VARCHAR(50);
